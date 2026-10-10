# Roadmap

## Done
- [x] Identity/credits DB layer: national ID (server validation, immutable once verified), 40-question welcome bonus with 24h server-side expiry, تعجيزي entitlement flag
- [x] Bonus-aware atomic reserve/commit/release (bonus spent first, never carries over)
- [x] Server-side تعجيزي + feature-flag gate BEFORE credit reservation and any AI call
- [x] Admin content DB layer: landing sections, teachers, FAQ, footer links, social links, site settings, announcements, payment methods, academic stages/tracks, feature flags
- [x] Plan extensions (duration, original price, badge, promo, features list, competition eligibility)
- [x] Competition: manual/auto activation by eligible subscriber count, server activation timestamp, 30-day default duration, auto-end, eligibility + registration RPCs
- [x] Dark/light theme, floating pill header, W hover reveal ("ويسو إيجنت"), DB-driven large footer, DB-driven landing page

## Remaining
- [ ] Admin UI pages for the new content/config tables (sections, teachers, FAQ, footer, social, announcements, payment methods, academic stages, feature flags, competition)
- [ ] Student subscription/payment page (plan -> phone -> method -> proof -> admin review)
- [ ] National ID submission UI + PDF export with raw-ID watermark
- [ ] Google/email onboarding requiring stage before profile completion
- [ ] Tests for welcome bonus expiry, تعجيزي gate, competition eligibility
