export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>404 — الصفحة غير موجودة | WISO</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
      }

      body {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          radial-gradient(circle at 50% 20%, rgba(66, 87, 34, 0.08), transparent 35%),
          #f7f8f4;
        color: #1d2417;
        font-family:
          "IBM Plex Sans Arabic",
          "Cairo",
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      .card {
        width: min(100%, 620px);
        padding: 48px 32px;
        text-align: center;
      }

      .logo {
        width: 58px;
        height: 58px;
        margin: 0 auto 28px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: #425722;
        color: #fff;
        font-size: 30px;
        font-weight: 800;
        box-shadow: 0 14px 35px rgba(66, 87, 34, 0.18);
      }

      .code {
        margin: 0;
        font-size: clamp(76px, 16vw, 130px);
        line-height: 0.9;
        font-weight: 800;
        letter-spacing: -5px;
        color: #425722;
      }

      h1 {
        margin: 28px 0 10px;
        font-size: clamp(22px, 4vw, 30px);
        line-height: 1.4;
        font-weight: 700;
      }

      p {
        max-width: 460px;
        margin: 0 auto;
        color: #68705f;
        font-size: 16px;
        line-height: 1.9;
      }

      .actions {
        margin-top: 30px;
        display: flex;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      a,
      button {
        min-height: 46px;
        padding: 10px 20px;
        border-radius: 12px;
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          background 0.2s ease;
      }

      a:hover,
      button:hover {
        transform: translateY(-2px);
      }

      .primary {
        border: 1px solid #425722;
        background: #425722;
        color: #fff;
        box-shadow: 0 8px 20px rgba(66, 87, 34, 0.16);
      }

      .primary:hover {
        background: #35481c;
      }

      .secondary {
        border: 1px solid #d8ddd0;
        background: #fff;
        color: #425722;
      }

      .secondary:hover {
        background: #f1f3ed;
      }

      .footer {
        margin-top: 42px;
        color: #9aa092;
        font-size: 12px;
      }

      @media (max-width: 480px) {
        .card {
          padding: 36px 18px;
        }

        .code {
          letter-spacing: -3px;
        }

        .actions {
          flex-direction: column;
        }

        a,
        button {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="logo">W</div>
      <div class="code">404</div>
      <h1>الصفحة دي مش موجودة</h1>
      <p>
        يبدو إنك وصلت لمكان مش موجود في رحلة WISO.
        متقلقش، طريقك لسه موجود — ارجع للصفحة الرئيسية وكمل رحلتك نحو التفوق.
      </p>
      <div class="actions">
        <a class="primary" href="/">العودة للرئيسية</a>
        <button class="secondary" onclick="history.back()">العودة للصفحة السابقة</button>
      </div>
      <div class="footer">
        WISO — وكيلك الذكي في رحلتك نحو التفوق
      </div>
    </main>
  </body>
</html>`;
}
