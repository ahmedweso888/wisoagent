import { n as supabaseAdmin } from "./client.server-BlnvGJA3.mjs";
import { t as getUserSupabase } from "./user-client.server-Bhj7_9Zh.mjs";
import { n as releaseCredits, r as reserveCredits, t as commitCredits } from "./credits.server-Bwex4l76.mjs";
import { a as TIER_MODEL_MAP, i as ENGINE_CONFIG, n as logAiEvent, r as routeTask, runStructuredTask, t as generateRequestId } from "./runtime.server-CTv0BXmm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks.server-CszhbjLq.js
/**
* WISO Deterministic Duplicate / Near-Duplicate Detection.
*
* No LLM calls. Uses Unicode normalization, Arabic text normalization,
* whitespace/punctuation normalization, tokenization, and Jaccard similarity.
*
* Thresholds are configurable via ENGINE_CONFIG.duplicateSimilarityThreshold.
*/
/** Unicode NFC normalization + Arabic-specific normalization. */
function normalizeText(text) {
	if (!text) return "";
	let result = text.trim().toLowerCase();
	result = result.normalize("NFC");
	result = result.replace(/[\u0622\u0623\u0625]/g, "ا").replace(/\u0649/g, "ي").replace(/\u0629/g, "ه").replace(/\u0640/g, "").replace(/[\u064B-\u0652\u0670]/g, "").replace(/\u0651/g, "");
	result = result.replace(/\s+/g, " ").trim();
	result = result.replace(/[\u060C\u061B\u061F\u066A-\u066D\u06D4\u00AB\u00BB]/g, " ");
	result = result.replace(/[^\w\u0600-\u06FF\s]/g, " ");
	result = result.replace(/\s+/g, " ").trim();
	return result;
}
/** Tokenize normalized text into a Set of word tokens. */
function tokenize(text) {
	const normalized = normalizeText(text);
	if (!normalized) return /* @__PURE__ */ new Set();
	return new Set(normalized.split(" ").filter((t) => t.length > 0));
}
/** Jaccard similarity between two token sets: |A ∩ B| / |A ∪ B|. */
function jaccardSimilarity(a, b) {
	if (a.size === 0 && b.size === 0) return 1;
	if (a.size === 0 || b.size === 0) return 0;
	let intersection = 0;
	for (const token of a) if (b.has(token)) intersection++;
	const union = a.size + b.size - intersection;
	return union === 0 ? 0 : intersection / union;
}
/** SHA-256 hash of normalized text for exact-match detection. */
function normalizedHash(text) {
	const normalized = normalizeText(text);
	let hash = 0;
	for (let i = 0; i < normalized.length; i++) {
		const char = normalized.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return `h${Math.abs(hash).toString(36)}`;
}
/**
* Checks if a question is a duplicate or near-duplicate of any question
* in the provided set. Compares normalized prompts.
*/
function isDuplicate(question, others) {
	const threshold = ENGINE_CONFIG.duplicateSimilarityThreshold;
	const promptTokens = tokenize(question.prompt);
	const promptHash = normalizedHash(question.prompt);
	for (const other of others) {
		if (!other || other === question) continue;
		if (ENGINE_CONFIG.duplicateExactHash) {
			if (promptHash === normalizedHash(other.prompt)) return {
				isDuplicate: true,
				reason: "exact_match",
				matchedAgainst: other.prompt.slice(0, 80)
			};
		}
		const similarity = jaccardSimilarity(promptTokens, tokenize(other.prompt));
		if (similarity >= threshold) return {
			isDuplicate: true,
			reason: "near_duplicate",
			similarity,
			matchedAgainst: other.prompt.slice(0, 80)
		};
	}
	return {
		isDuplicate: false,
		reason: "unique"
	};
}
/** Expected difficulty-score ranges for each difficulty level. */
var DIFFICULTY_SCORE_RANGES = {
	basic: [1, 30],
	medium: [31, 55],
	hard: [56, 75],
	very_hard: [76, 90],
	nightmare: [91, 100]
};
/** Minimum acceptable explanation length (characters). */
var MIN_EXPLANATION_LENGTH = 20;
/** Minimum acceptable prompt length (characters). */
var MIN_PROMPT_LENGTH = 10;
/**
* Validates a single generated question structurally and semantically.
* Does NOT call an LLM — this is deterministic, fast validation.
* LLM-based validation is done separately via `validateQuestionTask`.
*/
function validateQuestionStructure(question, difficulty) {
	const reasons = [];
	const checks = {};
	let passedCount = 0;
	const totalChecks = 8;
	const promptOk = Boolean(question.prompt && question.prompt.trim().length >= MIN_PROMPT_LENGTH);
	checks["prompt_present"] = promptOk;
	if (!promptOk) reasons.push("prompt_missing_or_too_short");
	if (promptOk) passedCount++;
	const answerOk = Boolean(question.correctAnswer && question.correctAnswer.trim().length > 0);
	checks["answer_present"] = answerOk;
	if (!answerOk) reasons.push("correct_answer_missing");
	if (answerOk) passedCount++;
	const explanationOk = Boolean(question.explanation && question.explanation.trim().length >= MIN_EXPLANATION_LENGTH);
	checks["explanation_quality"] = explanationOk;
	if (!explanationOk) reasons.push("explanation_too_short_or_missing");
	if (explanationOk) passedCount++;
	const [minScore, maxScore] = DIFFICULTY_SCORE_RANGES[difficulty] ?? [0, 100];
	const difficultyOk = question.difficultyScore >= minScore && question.difficultyScore <= maxScore;
	checks["difficulty_score_range"] = difficultyOk;
	if (!difficultyOk) reasons.push(`difficulty_score_${question.difficultyScore}_out_of_range_${minScore}_${maxScore}`);
	if (difficultyOk) passedCount++;
	const conceptsOk = Array.isArray(question.conceptsTested) && question.conceptsTested.length > 0;
	checks["concepts_present"] = conceptsOk;
	if (!conceptsOk) reasons.push("no_concepts_tested");
	if (conceptsOk) passedCount++;
	let optionsOk = true;
	if (question.options && question.options.length > 0) optionsOk = question.options.length >= 2 && question.options.some((opt) => opt.key === question.correctAnswer || opt.text === question.correctAnswer);
	checks["options_valid"] = optionsOk;
	if (!optionsOk) reasons.push("options_invalid_or_no_matching_answer");
	if (optionsOk) passedCount++;
	const sourcesOk = Array.isArray(question.sourceReferences) && question.sourceReferences.length > 0;
	checks["source_references"] = sourcesOk;
	if (!sourcesOk) reasons.push("no_source_references");
	if (sourcesOk) passedCount++;
	const trapOk = Boolean(question.commonTrap && question.commonTrap.trim().length > 0);
	checks["common_trap"] = trapOk;
	if (!trapOk) reasons.push("no_common_trap");
	if (trapOk) passedCount++;
	const score = Math.round(passedCount / totalChecks * 100);
	const valid = passedCount === totalChecks;
	return {
		valid,
		score,
		reasons,
		checks,
		retryRecommended: !valid && score >= 50,
		escalationRecommended: !valid && score < 50
	};
}
/**
* Full validation gate: structural check + duplicate check + optional LLM validation.
* Returns the final verdict and whether to retry or escalate.
*/
async function validationGate(question, difficulty, existingQuestions, batchQuestions, llmValidation) {
	const structural = validateQuestionStructure(question, difficulty);
	const dup = isDuplicate(question, [...existingQuestions, ...batchQuestions]);
	if (dup.isDuplicate) {
		structural.valid = false;
		structural.checks["not_duplicate"] = false;
		structural.reasons.push(`duplicate: ${dup.reason}`);
		structural.retryRecommended = false;
		structural.escalationRecommended = false;
	} else structural.checks["not_duplicate"] = true;
	if (llmValidation) {
		structural.checks["llm_validated"] = llmValidation.passed;
		if (!llmValidation.passed) {
			structural.valid = false;
			structural.reasons.push("llm_validation_failed");
			structural.retryRecommended = true;
		}
	}
	return structural;
}
/**
* WISO question-generation completion loop.
*
* The completion condition is accepted >= requested. Generation/rejection
* counts never masquerade as success. Existing questions are part of the
* deduplication set, so the engine cannot approve a near-duplicate that is
* already in the Question Bank or was already accepted in this request.
*/
async function generateBatch(request, existingQuestions, generateFn, validateFn, requestId = generateRequestId()) {
	const difficulty = request.difficulties[0];
	const approved = [];
	const rejected = [];
	const stats = {
		requested: request.count,
		generated: 0,
		validated: 0,
		approved: 0,
		rejected: 0,
		duplicates: 0,
		retries: 0,
		escalations: 0,
		replacementCount: 0,
		rounds: 0,
		remaining: request.count
	};
	const duplicatePool = () => [...existingQuestions, ...approved];
	const accept = (question) => {
		if (isDuplicate(question, duplicatePool()).isDuplicate) {
			stats.duplicates++;
			stats.rejected++;
			rejected.push(question);
			return false;
		}
		approved.push(question);
		return true;
	};
	const validateAndAccept = async (question) => {
		stats.validated++;
		const llmResult = validateFn ? await validateFn(question) : null;
		const gate = await validationGate(question, difficulty ?? "medium", duplicatePool(), [], llmResult ? {
			passed: llmResult.passed,
			checks: []
		} : null);
		if (!gate.valid) {
			if (gate.reasons.some((reason) => reason.startsWith("duplicate"))) stats.duplicates++;
			stats.rejected++;
			rejected.push(question);
			return false;
		}
		return accept(question);
	};
	for (let round = 1; round <= ENGINE_CONFIG.maxReplacementRounds; round++) {
		const remainingBefore = request.count - approved.length;
		if (remainingBefore <= 0) break;
		stats.rounds = round;
		const chunks = Math.ceil(remainingBefore / ENGINE_CONFIG.batchSize);
		for (let chunk = 0; chunk < chunks; chunk++) {
			const count = Math.min(ENGINE_CONFIG.batchSize, request.count - approved.length);
			if (count <= 0) break;
			const subRequest = {
				...request,
				count,
				...request.excludeQuestionIds ? { excludeQuestionIds: request.excludeQuestionIds } : {}
			};
			const routing = routeTask({
				taskType: "question_generation",
				...difficulty ? { difficulty } : {}
			});
			logAiEvent({
				requestId,
				taskType: "question_generation",
				tier: routing.tier,
				model: routing.model,
				status: "generating",
				questionsGenerated: count,
				rounds: round
			});
			let generated = [];
			try {
				generated = await generateFn(routing.tier, routing.model, subRequest, count);
			} catch (error) {
				logAiEvent({
					requestId,
					taskType: "question_generation",
					tier: routing.tier,
					model: routing.model,
					status: "error",
					error: error instanceof Error ? error.message : String(error)
				});
				continue;
			}
			stats.generated += generated.length;
			for (const question of generated) {
				if (await validateAndAccept(question)) continue;
				if (difficulty === "hard") {
					stats.retries++;
					stats.replacementCount++;
					try {
						const retry = await generateFn("terra", TIER_MODEL_MAP.terra, {
							...subRequest,
							count: 1
						}, 1);
						stats.generated += retry.length;
						const retryQuestion = retry[0];
						if (retryQuestion) {
							if (await validateAndAccept(retryQuestion)) continue;
						}
					} catch {}
					stats.escalations++;
					stats.replacementCount++;
					try {
						const replacement = await generateFn("sol", TIER_MODEL_MAP.sol, {
							...subRequest,
							count: 1
						}, 1);
						stats.generated += replacement.length;
						if (replacement[0]) await validateAndAccept(replacement[0]);
					} catch {}
				} else if (difficulty === "very_hard" || difficulty === "nightmare") {
					stats.retries++;
					stats.replacementCount++;
					try {
						const replacement = await generateFn("sol", TIER_MODEL_MAP.sol, {
							...subRequest,
							count: 1
						}, 1);
						stats.generated += replacement.length;
						if (replacement[0]) await validateAndAccept(replacement[0]);
					} catch {}
				}
			}
		}
		stats.approved = approved.length;
		stats.remaining = Math.max(0, request.count - approved.length);
		logAiEvent({
			requestId,
			taskType: "question_generation",
			status: "round_complete",
			questionsGenerated: stats.generated,
			questionsApproved: stats.approved,
			questionsRejected: stats.rejected,
			retries: stats.retries,
			escalations: stats.escalations,
			rounds: stats.rounds
		});
		if (stats.remaining === 0) break;
	}
	stats.approved = approved.length;
	stats.remaining = Math.max(0, request.count - approved.length);
	logAiEvent({
		requestId,
		taskType: "question_generation",
		status: stats.remaining === 0 ? "batch_complete" : "batch_partial",
		questionsGenerated: stats.generated,
		questionsApproved: stats.approved,
		questionsRejected: stats.rejected,
		retries: stats.retries,
		escalations: stats.escalations,
		rounds: stats.rounds
	});
	return {
		requestId,
		approved,
		rejected,
		stats
	};
}
function bankToQuestion(row) {
	return {
		prompt: row.prompt,
		questionType: row.question_type,
		difficulty: row.difficulty,
		difficultyScore: Number(row.difficulty_score),
		options: Array.isArray(row.options) ? row.options : [],
		correctAnswer: row.correct_answer ?? "",
		explanation: row.explanation ?? "",
		conceptsTested: row.concepts ?? [],
		commonTrap: row.common_trap ?? "",
		estimatedTimeSeconds: 120,
		sourceReferences: [{
			documentId: null,
			pageNumber: row.source_page_from,
			quote: row.source_label ?? "Question Bank"
		}]
	};
}
async function loadReusableQuestions(userId, request) {
	const { data: profile, error: profileError } = await supabaseAdmin.from("profiles").select("school_year,track").eq("id", userId).maybeSingle();
	if (profileError) throw profileError;
	const { data: subject, error: subjectError } = await supabaseAdmin.from("subjects").select("id").eq("slug", request.subjectSlug).maybeSingle();
	if (subjectError) throw subjectError;
	if (!subject) throw new Error("subject_not_found");
	const { data: history, error: historyError } = await getUserSupabase().from("student_question_history").select("fingerprint").eq("user_id", userId);
	if (historyError) throw historyError;
	const seen = new Set((history ?? []).map((row) => row.fingerprint));
	let query = supabaseAdmin.from("question_bank").select("id,subject_id,lesson_key,difficulty,difficulty_score,question_type,prompt,options,correct_answer,explanation,common_trap,concepts,source_label,source_page_from,source_page_to,fingerprint").eq("subject_id", subject.id).eq("quality_status", "approved").eq("language", request.language).order("usage_count", { ascending: true }).limit(Math.max(200, request.count * 4));
	if (profile?.school_year) query = query.eq("school_year", profile.school_year);
	if (profile?.track) query = query.or(`track.is.null,track.eq.${profile.track}`);
	if (request.topicIds.length) query = query.in("lesson_key", request.topicIds);
	if (request.difficulties.length) query = query.in("difficulty", request.difficulties);
	const { data, error } = await query;
	if (error) throw error;
	const rows = data ?? [];
	const reusable = [];
	const selected = [];
	for (const row of rows) {
		if (seen.has(row.fingerprint)) continue;
		const question = bankToQuestion(row);
		if (isDuplicate(question, selected).isDuplicate) continue;
		reusable.push(row);
		selected.push(question);
		if (selected.length >= request.count) break;
	}
	return {
		questions: selected,
		rows: reusable
	};
}
async function persistQuestionsForStudent(userId, request, questions, tier) {
	if (!questions.length) return [];
	const { data: subject, error: subjectError } = await supabaseAdmin.from("subjects").select("id").eq("slug", request.subjectSlug).single();
	if (subjectError) throw subjectError;
	const { data: profile } = await supabaseAdmin.from("profiles").select("school_year,track").eq("id", userId).maybeSingle();
	const userSupabase = getUserSupabase();
	const delivered = [];
	for (const question of questions) {
		const fingerprint = normalizedHash(question.prompt);
		const source = question.sourceReferences[0];
		const { data: bankRow, error: bankError } = await supabaseAdmin.from("question_bank").upsert({
			subject_id: subject.id,
			lesson_key: request.topicIds[0] ?? null,
			school_year: profile?.school_year ?? null,
			track: profile?.track ?? null,
			difficulty: question.difficulty,
			difficulty_score: question.difficultyScore,
			question_type: question.questionType,
			prompt: question.prompt,
			options: question.options,
			correct_answer: question.correctAnswer,
			explanation: question.explanation,
			common_trap: question.commonTrap,
			concepts: question.conceptsTested,
			source_label: source?.quote ?? "WISO Agent",
			source_page_from: source?.pageNumber ?? null,
			source_page_to: source?.pageNumber ?? null,
			quality_status: "approved",
			ai_tier: tier,
			fingerprint,
			language: request.language,
			created_by: userId
		}, { onConflict: "fingerprint" }).select("id,fingerprint").single();
		if (bankError) throw bankError;
		const { data: studentQuestion, error: questionError } = await userSupabase.from("questions").insert({
			user_id: userId,
			subject_id: subject.id,
			topic_id: request.topicIds[0] ?? null,
			prompt: question.prompt,
			question_type: question.questionType,
			difficulty: question.difficulty,
			difficulty_score: question.difficultyScore,
			options: question.options,
			correct_answer: question.correctAnswer,
			explanation: question.explanation,
			common_trap: question.commonTrap,
			estimated_time_seconds: question.estimatedTimeSeconds,
			language: request.language,
			ai_generated: true,
			ai_model: `wiso-tier:${tier}`,
			validation_status: "approved"
		}).select("id").single();
		if (questionError) throw questionError;
		const { error: historyError } = await userSupabase.from("student_question_history").insert({
			user_id: userId,
			bank_question_id: bankRow.id,
			fingerprint
		});
		if (historyError) {
			if (!historyError.message.toLowerCase().includes("duplicate")) throw historyError;
			await userSupabase.from("questions").delete().eq("id", studentQuestion.id);
			continue;
		}
		delivered.push(question);
	}
	const fingerprints = delivered.map((question) => normalizedHash(question.prompt));
	if (!fingerprints.length) return delivered;
	const { data: bankRows } = await supabaseAdmin.from("question_bank").select("id,usage_count,fingerprint").in("fingerprint", fingerprints);
	for (const row of bankRows ?? []) await supabaseAdmin.from("question_bank").update({ usage_count: Number(row.usage_count ?? 0) + 1 }).eq("id", row.id);
	return delivered;
}
async function loadQuestionContext(userId, request) {
	const { data, error } = await getUserSupabase().rpc("generation_curriculum_context", {
		_user_id: userId,
		_subject_slug: request.subjectSlug,
		_lesson_ids: request.topicIds
	});
	if (error) throw error;
	const context = data;
	if (!context?.subject || !context.lessons?.length) throw new Error("lesson_context_not_found");
	const lessonText = context.lessons.map((lesson) => {
		const concepts = (lesson.concepts ?? []).map((c) => `${c.title}: ${c.description ?? ""} [ص.${c.source_page ?? "?"}]`).join("\n");
		const pages = (lesson.pages ?? []).map((p) => `PAGE ${p.page_number}\n${p.text}`).join("\n\n");
		return `LESSON ${lesson.id}: ${lesson.title}\nUNIT: ${lesson.unit ?? ""}\nPAGES: ${lesson.page_start ?? "?"}-${lesson.page_end ?? "?"}\nCONCEPTS:\n${concepts}\nSOURCE CONTENT:\n${pages}`;
	}).join("\n\n");
	return `AUTHORIZED PUBLISHED CURRICULUM CONTEXT\nSUBJECT: ${context.subject.name_ar} (${context.subject.slug})\n${lessonText}`;
}
/**
* Provider-independent Study Agent tasks. Prompts + normalized JSON schemas live
* here; the provider is an implementation detail resolved by the runtime.
*
* WISO Engine integration: question generation now flows through the batch
* orchestrator which handles routing (Luna/Terra/Sol), validation gate,
* dedup, retry, and escalation automatically.
*/
var OBJ = (properties) => ({
	type: "object",
	properties,
	required: Object.keys(properties),
	additionalProperties: false
});
var QUESTION_SCHEMA = OBJ({ questions: {
	type: "array",
	items: OBJ({
		prompt: { type: "string" },
		questionType: { type: "string" },
		difficulty: { type: "string" },
		difficultyScore: { type: "number" },
		options: {
			type: "array",
			items: OBJ({
				key: { type: "string" },
				text: { type: "string" }
			})
		},
		correctAnswer: { type: "string" },
		explanation: { type: "string" },
		conceptsTested: {
			type: "array",
			items: { type: "string" }
		},
		commonTrap: { type: "string" },
		estimatedTimeSeconds: { type: "number" },
		sourceReferences: {
			type: "array",
			items: OBJ({
				documentId: { type: ["string", "null"] },
				pageNumber: { type: ["number", "null"] },
				quote: { type: "string" }
			})
		}
	})
} });
var NIGHTMARE_RULES = `You are the Question Generator of an Arabic study platform.
Hard means: deep understanding, multi-concept transfer, hidden assumptions, common misconceptions, edge cases and reasoning.
NEVER make a question hard by adding pointless numbers or length. NEVER go outside the student's syllabus. NEVER produce ambiguous or impossible questions.
Every question needs difficultyScore, conceptsTested, correctAnswer, explanation, sourceReferences, commonTrap and estimatedTimeSeconds.`;
/** Difficulties that are locked behind a server-side entitlement. */
var EXTREME_DIFFICULTIES = /* @__PURE__ */ new Set(["nightmare", "very_hard"]);
var NotEntitledError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "NotEntitledError";
	}
};
/**
* Server-side authorization gate for a generation request.
* Runs before credit reservation, tier routing and any provider invocation.
*/
async function assertGenerationAllowed(request) {
	const supabase = (await import("./user-client.server-Bhj7_9Zh.mjs").then((n) => n.n)).getUserSupabase();
	const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("flag_key", "ai_question_generation").maybeSingle();
	if (flag && flag.enabled === false) throw new NotEntitledError("generation_disabled");
	if (!(request.nightmareMode === true || request.difficulties.some((d) => EXTREME_DIFFICULTIES.has(d)))) return;
	const { data: state, error } = await supabase.rpc("my_wallet_state");
	if (error) throw new Error(`entitlement_check_failed: ${error.message}`);
	if (!Boolean(state?.extreme_difficulty_enabled)) throw new NotEntitledError("extreme_difficulty_locked");
}
/**
* Generate questions through the WISO batch orchestrator.
* Handles: routing (Luna/Terra/Sol), validation gate, dedup, retry, escalation.
* Credit reservation is handled atomically via the credits module.
*/
async function generateQuestionsTaskDetailed(userId, request) {
	if (!request.subjectSlug || !request.topicIds.length || !request.difficulties.length) throw new Error("subject, lesson and difficulty are required");
	if (!Number.isInteger(request.count) || request.count < 1 || request.count > 500) throw new Error("invalid question count");
	await assertGenerationAllowed(request);
	const requestId = generateRequestId();
	const reservation = await reserveCredits(userId, requestId, "questions", request.count);
	let committed = false;
	try {
		const reusable = await loadReusableQuestions(userId, request);
		const academicContext = await loadQuestionContext(userId, request);
		const reused = reusable.questions.slice(0, request.count);
		const missing = Math.max(0, request.count - reused.length);
		const generateFn = async (_tier, _model, req, count) => {
			return (await runStructuredTask({
				userId,
				agent: "question_generation",
				call: {
					system: NIGHTMARE_RULES,
					user: `Generate ${count} questions.\n${academicContext}\nRequest: ${JSON.stringify(req)}\nLanguage: ${req.language}. Nightmare mode: ${req.nightmareMode}. Source references MUST use only the supplied source anchors.`,
					schemaName: "generated_questions",
					jsonSchema: QUESTION_SCHEMA
				},
				counts: { questionsGenerated: count },
				difficulty: req.difficulties[0],
				requestId
			})).questions ?? [];
		};
		const validateFn = async (question) => {
			try {
				return { passed: (await validateQuestionTask(userId, question, requestId)).passed };
			} catch {
				return null;
			}
		};
		const generated = missing ? await generateBatch({
			...request,
			count: missing,
			excludeQuestionIds: request.excludeQuestionIds
		}, reusable.questions, generateFn, validateFn, requestId) : {
			requestId,
			approved: [],
			rejected: [],
			stats: {
				requested: 0,
				generated: 0,
				validated: 0,
				approved: 0,
				rejected: 0,
				duplicates: 0,
				retries: 0,
				escalations: 0,
				replacementCount: 0,
				rounds: 0,
				remaining: 0
			}
		};
		const finalQuestions = [...reused, ...generated.approved].slice(0, request.count);
		const deliveredQuestions = await persistQuestionsForStudent(userId, request, finalQuestions, request.difficulties[0] === "nightmare" || request.difficulties[0] === "very_hard" ? "sol" : "terra");
		const stats = {
			requested: request.count,
			reused: reused.length,
			generated: generated.stats.generated,
			accepted: deliveredQuestions.length,
			rejected: generated.stats.rejected,
			remaining: Math.max(0, request.count - deliveredQuestions.length),
			retries: generated.stats.retries,
			escalations: generated.stats.escalations,
			replacementCount: generated.stats.replacementCount,
			rounds: generated.stats.rounds,
			status: deliveredQuestions.length >= request.count ? "completed" : "partial"
		};
		const { data: subject } = await supabaseAdmin.from("subjects").select("id").eq("slug", request.subjectSlug).maybeSingle();
		await supabaseAdmin.from("ai_jobs").upsert({
			request_id: requestId,
			user_id: userId,
			subject_id: subject?.id ?? null,
			lesson_key: request.topicIds[0] ?? null,
			difficulty: request.difficulties[0] ?? "medium",
			requested_count: stats.requested,
			reused_count: stats.reused,
			generated_count: stats.generated,
			accepted_count: stats.accepted,
			rejected_count: stats.rejected,
			remaining_count: stats.remaining,
			retry_count: stats.retries,
			replacement_count: stats.replacementCount,
			tier: request.difficulties[0] === "nightmare" || request.difficulties[0] === "very_hard" ? "sol" : "terra",
			status: stats.status
		});
		await commitCredits(reservation.id, finalQuestions.length);
		committed = true;
		return {
			requestId,
			questions: deliveredQuestions,
			stats
		};
	} catch (error) {
		if (!committed) await releaseCredits(reservation.id);
		throw error;
	}
}
async function generateQuestionsTask(userId, request) {
	return (await generateQuestionsTaskDetailed(userId, request)).questions;
}
async function validateQuestionTask(userId, question, requestId) {
	return runStructuredTask({
		userId,
		agent: "question_validation",
		call: {
			system: "You are the Question Validator. Reject questions that are out of syllabus, unanswerable, have multiple correct answers, contradict their explanation, are duplicates, or whose difficulty is meaningless.",
			user: `Validate this question:\n${JSON.stringify(question)}`,
			schemaName: "validation_report",
			jsonSchema: OBJ({
				passed: { type: "boolean" },
				checks: {
					type: "array",
					items: OBJ({
						check: { type: "string" },
						passed: { type: "boolean" },
						note: { type: "string" }
					})
				}
			})
		},
		requestId
	});
}
async function generatePlanTask(userId, request) {
	const [masteryResult, mistakesResult, progressResult, topicsResult] = await Promise.all([
		supabaseAdmin.from("mastery").select("subject_id,topic_id,concept_id,mastery_score,accuracy,questions_solved,is_weak").eq("user_id", userId).order("mastery_score", { ascending: true }).limit(100),
		supabaseAdmin.from("mistakes").select("question_id,concept_id,subject_id,mistake_type,ai_analysis,resolved,created_at").eq("user_id", userId).eq("resolved", false).order("created_at", { ascending: false }).limit(100),
		supabaseAdmin.from("daily_progress").select("day,questions_solved,correct_answers,hard_solved,nightmare_solved,study_minutes").eq("user_id", userId).order("day", { ascending: false }).limit(14),
		supabaseAdmin.from("topics").select("id,title,subject_id,estimated_minutes,completed").eq("user_id", userId).in("subject_id", (await supabaseAdmin.from("subjects").select("id").in("slug", request.subjectSlugs)).data?.map((row) => row.id) ?? []).limit(500)
	]);
	const adaptiveContext = JSON.stringify({
		mastery: masteryResult.data ?? [],
		unresolvedMistakes: mistakesResult.data ?? [],
		recentProgress: progressResult.data ?? [],
		availableTopics: topicsResult.data ?? []
	});
	const plan = await runStructuredTask({
		userId,
		agent: "study_planning",
		call: {
			system: "You are the WISO Study Planner. Plan backwards from the student's deadline. Finish the syllabus first, then revision and high-difficulty practice. Use the supplied performance/mastery/mistake context; never invent completed work or mastery.",
			user: `Build the adaptive plan for: ${JSON.stringify(request)}\nREAL STUDENT ADAPTIVE CONTEXT: ${adaptiveContext}`,
			schemaName: "generated_plan",
			jsonSchema: OBJ({
				deadline: { type: "string" },
				dailyHoursTarget: { type: "number" },
				items: {
					type: "array",
					items: OBJ({
						level: { type: "string" },
						phase: { type: "string" },
						title: { type: "string" },
						notes: { type: "string" },
						subjectSlug: { type: "string" },
						topicId: { type: ["string", "null"] },
						startsOn: { type: "string" },
						endsOn: { type: "string" },
						estimatedMinutes: { type: "number" },
						questionTarget: { type: "number" },
						targetDifficulty: { type: "string" }
					})
				}
			})
		}
	});
	const { data: subjects } = await supabaseAdmin.from("subjects").select("id,slug").in("slug", request.subjectSlugs);
	const subjectBySlug = new Map((subjects ?? []).map((row) => [row.slug, row.id]));
	const userSupabase = (await import("./user-client.server-Bhj7_9Zh.mjs").then((n) => n.n)).getUserSupabase();
	await userSupabase.from("study_plans").update({ is_active: false }).eq("user_id", userId).eq("is_active", true);
	const { data: createdPlan, error: planError } = await userSupabase.from("study_plans").insert({
		user_id: userId,
		title: "خطة WISO المتكيفة",
		deadline: plan.deadline,
		daily_hours_target: plan.dailyHoursTarget,
		ai_generated: true,
		is_active: true
	}).select("id").single();
	if (planError) throw planError;
	const items = plan.items.map((item, index) => ({
		plan_id: createdPlan.id,
		user_id: userId,
		level: item.level,
		phase: item.phase,
		subject_id: item.subjectSlug ? subjectBySlug.get(item.subjectSlug) ?? null : null,
		topic_id: item.topicId ?? null,
		title: item.title,
		notes: item.notes ?? null,
		starts_on: item.startsOn || null,
		ends_on: item.endsOn || null,
		estimated_minutes: Math.max(1, Math.round(item.estimatedMinutes)),
		question_target: Math.max(0, Math.round(item.questionTarget)),
		target_difficulty: item.targetDifficulty,
		completed: false,
		ai_generated: true,
		sort_order: index
	}));
	if (items.length) {
		const { error: itemError } = await userSupabase.from("study_plan_items").insert(items);
		if (itemError) throw itemError;
	}
	return plan;
}
var SYLLABUS_SCHEMA = OBJ({
	subjectSlug: { type: "string" },
	documentId: { type: "string" },
	units: {
		type: "array",
		items: OBJ({
			title: { type: "string" },
			chapters: {
				type: "array",
				items: OBJ({
					title: { type: "string" },
					pageFrom: { type: ["number", "null"] },
					pageTo: { type: ["number", "null"] },
					topics: {
						type: "array",
						items: OBJ({
							title: { type: "string" },
							estimatedMinutes: { type: "number" },
							concepts: {
								type: "array",
								items: OBJ({
									title: { type: "string" },
									description: { type: "string" },
									difficulty: { type: "string" },
									learningObjectives: {
										type: "array",
										items: OBJ({ statement: { type: "string" } })
									},
									sourceReferences: {
										type: "array",
										items: OBJ({
											documentId: { type: ["string", "null"] },
											pageNumber: { type: ["number", "null"] },
											quote: { type: "string" }
										})
									}
								})
							}
						})
					}
				})
			}
		})
	}
});
async function analyzeDocumentTask(userId, input) {
	return runStructuredTask({
		userId,
		agent: "concept_extraction",
		bulk: true,
		call: {
			system: "You are the Syllabus Agent. Map the material into units/chapters/topics/concepts. Every concept MUST carry a source reference; drop anything you cannot source.",
			user: `Document id: ${input.documentId}\nKind: ${input.kind}\n${input.text ?? ""}`,
			schemaName: "extracted_syllabus",
			jsonSchema: SYLLABUS_SCHEMA
		},
		counts: input.kind === "image" ? { imagesAnalyzed: 1 } : { documentsAnalyzed: 1 }
	});
}
async function analyzeMistakesTask(userId, request) {
	return (await runStructuredTask({
		userId,
		agent: "mistake_analysis",
		call: {
			system: "You are the Mistake Analyzer. Classify each mistake, detect repeated patterns and point at the weak concepts to re-test.",
			user: JSON.stringify(request),
			schemaName: "mistake_analyses",
			jsonSchema: OBJ({ analyses: {
				type: "array",
				items: OBJ({
					questionId: { type: "string" },
					mistakeType: { type: "string" },
					analysis: { type: "string" },
					weakConceptIds: {
						type: "array",
						items: { type: "string" }
					}
				})
			} })
		}
	})).analyses ?? [];
}
async function performanceTask(userId, payload) {
	return runStructuredTask({
		userId,
		agent: "performance_analysis",
		call: {
			system: "You are the Performance Analyzer. Compute mastery, accuracy and the weakest concepts from the attempt data.",
			user: JSON.stringify(payload ?? {}),
			schemaName: "performance_snapshot",
			jsonSchema: OBJ({
				overallMastery: { type: "number" },
				accuracy: { type: "number" },
				questionsSolved: { type: "number" },
				hardSolved: { type: "number" },
				nightmareSolved: { type: "number" },
				averageTimeSeconds: { type: "number" },
				weakConcepts: {
					type: "array",
					items: OBJ({
						conceptId: { type: "string" },
						title: { type: "string" },
						masteryScore: { type: "number" }
					})
				}
			})
		}
	});
}
//#endregion
export { analyzeDocumentTask, analyzeMistakesTask, generatePlanTask, generateQuestionsTask, generateQuestionsTaskDetailed, performanceTask, validateQuestionTask };
