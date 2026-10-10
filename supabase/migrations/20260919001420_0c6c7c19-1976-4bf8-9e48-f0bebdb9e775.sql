INSERT INTO public.site_settings (key, value) VALUES
  ('pdf_enabled', 'true'),
  ('pdf_credit_cost', '1'),
  ('pdf_supported_types', '["worksheet","exam"]'),
  ('pdf_default_title', 'ورقة أسئلة WISO'),
  ('pdf_footer_notice', 'WISO Agent — للاستخدام التعليمي الشخصي')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.academic_stages (name_ar, slug, sort_order)
VALUES
  ('المرحلة الإعدادية', 'preparatory', 10),
  ('المرحلة الثانوية', 'secondary', 20)
ON CONFLICT (slug) DO NOTHING;