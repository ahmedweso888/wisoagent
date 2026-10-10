declare module "arabic-persian-reshaper" {
  const reshaper: {
    ArabicShaper: { convertArabic(value: string): string };
    PersianShaper: { convertArabic(value: string): string };
  };
  export default reshaper;
}
