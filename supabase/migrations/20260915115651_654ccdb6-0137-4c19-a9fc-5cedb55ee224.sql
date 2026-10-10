CREATE OR REPLACE FUNCTION public.record_question_attempt(
  _question_id UUID,
  _answer_given TEXT,
  _time_taken_seconds INTEGER DEFAULT 0,
  _confidence INTEGER DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _q public.questions;
  _attempt public.question_attempts;
  _correct BOOLEAN;
  _concept RECORD;
  _old public.mastery;
  _new_score NUMERIC;
  _new_questions INTEGER;
  _new_correct NUMERIC;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _time_taken_seconds < 0 OR _time_taken_seconds > 86400 THEN RAISE EXCEPTION 'invalid time'; END IF;
  SELECT * INTO _q FROM public.questions WHERE id = _question_id AND user_id = _uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'question not found'; END IF;

  _correct := lower(trim(COALESCE(_answer_given, ''))) = lower(trim(COALESCE(_q.correct_answer, '')));

  INSERT INTO public.question_attempts(question_id, user_id, answer_given, is_correct, time_taken_seconds, confidence)
  VALUES (_question_id, _uid, _answer_given, _correct, _time_taken_seconds, _confidence)
  RETURNING * INTO _attempt;

  UPDATE public.questions SET
    times_attempted = times_attempted + 1,
    times_correct = times_correct + CASE WHEN _correct THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE id = _question_id;

  FOR _concept IN
    SELECT concept_id FROM public.question_concepts WHERE question_id = _question_id AND user_id = _uid
  LOOP
    SELECT * INTO _old FROM public.mastery
    WHERE user_id = _uid AND concept_id = _concept.concept_id FOR UPDATE;

    IF FOUND THEN
      _new_questions := _old.questions_solved + 1;
      _new_correct := _old.accuracy * _old.questions_solved / 100.0 + CASE WHEN _correct THEN 1 ELSE 0 END;
      _new_score := LEAST(100, GREATEST(0,
        CASE WHEN _correct THEN _old.mastery_score + 6 ELSE _old.mastery_score - 10 END));
      UPDATE public.mastery SET
        mastery_score = _new_score,
        accuracy = ROUND((_new_correct / NULLIF(_new_questions, 0)) * 100, 2),
        questions_solved = _new_questions,
        is_weak = _new_score < 60,
        updated_at = now()
      WHERE id = _old.id;
    ELSE
      INSERT INTO public.mastery(user_id, subject_id, concept_id, mastery_score, accuracy, questions_solved, is_weak)
      VALUES (_uid, _q.subject_id, _concept.concept_id, CASE WHEN _correct THEN 60 ELSE 25 END,
              CASE WHEN _correct THEN 100 ELSE 0 END, 1, NOT _correct);
    END IF;

    IF NOT _correct THEN
      INSERT INTO public.mistakes(user_id, question_id, attempt_id, concept_id, subject_id, mistake_type, answer_given, correct_answer)
      VALUES (_uid, _question_id, _attempt.id, _concept.concept_id, _q.subject_id, 'knowledge_gap', _answer_given, _q.correct_answer);
    END IF;
  END LOOP;

  INSERT INTO public.daily_progress(user_id, day, questions_solved, correct_answers, hard_solved, nightmare_solved, study_minutes)
  VALUES (_uid, CURRENT_DATE, 1, CASE WHEN _correct THEN 1 ELSE 0 END,
          CASE WHEN _q.difficulty IN ('hard','very_hard') THEN 1 ELSE 0 END,
          CASE WHEN _q.difficulty = 'nightmare' THEN 1 ELSE 0 END,
          CEIL(_time_taken_seconds / 60.0)::INTEGER)
  ON CONFLICT (user_id, day) DO UPDATE SET
    questions_solved = daily_progress.questions_solved + 1,
    correct_answers = daily_progress.correct_answers + CASE WHEN _correct THEN 1 ELSE 0 END,
    hard_solved = daily_progress.hard_solved + CASE WHEN _q.difficulty IN ('hard','very_hard') THEN 1 ELSE 0 END,
    nightmare_solved = daily_progress.nightmare_solved + CASE WHEN _q.difficulty = 'nightmare' THEN 1 ELSE 0 END,
    study_minutes = daily_progress.study_minutes + CEIL(_time_taken_seconds / 60.0)::INTEGER;

  RETURN jsonb_build_object('attempt_id', _attempt.id, 'is_correct', _correct, 'question_id', _question_id);
END; $$;

REVOKE ALL ON FUNCTION public.record_question_attempt(UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_question_attempt(UUID, TEXT, INTEGER, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_review_special_request(
  _request UUID,
  _status TEXT,
  _price_egp NUMERIC DEFAULT NULL,
  _admin_note TEXT DEFAULT NULL
) RETURNS public.special_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.special_requests;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status NOT IN ('accepted','rejected','completed') THEN RAISE EXCEPTION 'invalid_status'; END IF;
  UPDATE public.special_requests SET status = _status, price_egp = _price_egp, admin_note = _admin_note,
    reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = _request RETURNING * INTO _row;
  IF NOT FOUND THEN RAISE EXCEPTION 'request_not_found'; END IF;
  INSERT INTO public.notifications(user_id, title, body, kind)
  VALUES (_row.user_id, 'تحديث على طلبك الخاص', COALESCE(_admin_note, CASE _status WHEN 'accepted' THEN 'تم قبول طلبك.' WHEN 'rejected' THEN 'تم رفض طلبك.' ELSE 'تم إكمال طلبك.' END), 'special_request');
  PERFORM public.admin_log(_row.user_id, 'review_special_request', jsonb_build_object('request', _request, 'status', _status, 'price_egp', _price_egp));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_review_special_request(UUID, TEXT, NUMERIC, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_special_request(UUID, TEXT, NUMERIC, TEXT) TO authenticated;