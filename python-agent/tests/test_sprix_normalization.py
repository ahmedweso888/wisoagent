from app.sprix_agent.normalization import fingerprint, normalize_arabic_text, normalize_option_text


def test_arabic_normalization():
    assert normalize_arabic_text("إِنَّ المالَ، مهمٌ!!") == "ان المال مهم"


def test_option_normalization():
    assert normalize_option_text("أ) الإجابة الصحيحة") == "الاجابة الصحيحة"


def test_fingerprint_is_order_independent():
    assert fingerprint("ما هو الادخار؟", ["نعم", "لا"]) == fingerprint("ما هو الادخار؟", ["لا", "نعم"])
