import{i as e,n as t,t as n}from"./jsx-runtime-Dk72oS4N.js";import{S as r,a as i,g as a,t as o,w as s}from"./index-DxNCYioU.js";import{t as c}from"./button-siwNbNPf.js";import{t as l}from"./label-9ifzNZtS.js";import{t as u}from"./Footer-Dtyra6UZ.js";import{t as d}from"./input-CmbQ3VMt.js";import{i as f,n as p,r as m,t as h}from"./tabs-CBfmksGQ.js";var g=e(t()),_=n();function v(){let e=s(),[t,n]=(0,g.useState)(!1),[v,y]=(0,g.useState)(``),[b,x]=(0,g.useState)(``),[S,C]=(0,g.useState)(``);async function w(t){t.preventDefault(),n(!0);let{error:r}=await a.auth.signInWithPassword({email:v,password:b});if(r){n(!1),i.error(`حصلت مشكلة بسيطة. جرّب تاني كده.`);return}await e({to:`/dashboard`}),n(!1)}async function T(t){t.preventDefault(),n(!0);let{data:r,error:o}=await a.auth.signUp({email:v,password:b,options:{emailRedirectTo:window.location.origin,data:{full_name:S}}});if(n(!1),o){i.error(`حصلت مشكلة بسيطة. جرّب تاني كده.`);return}if(!r.session){i.success(`بصّ في إيميلك وأكّد الحساب.`);return}e({to:`/onboarding`})}async function E(){if(!v){i.error(`اكتب إيميلك الأول.`);return}n(!0),await a.auth.resetPasswordForEmail(v,{redirectTo:`${window.location.origin}/reset-password`}),n(!1),i.success(`بعتنالك لينك لو الإيميل مسجّل عندنا.`)}async function D(){n(!0);let{error:e}=await a.auth.signInWithOAuth({provider:`google`,options:{redirectTo:`${window.location.origin}/onboarding`}});e&&(n(!1),i.error(`تعذّر الدخول بجوجل. جرّب تاني.`))}return(0,_.jsxs)(`div`,{dir:`rtl`,className:`flex min-h-screen flex-col bg-background`,children:[(0,_.jsxs)(`div`,{className:`grid flex-1 grid-cols-1 lg:grid-cols-2`,children:[(0,_.jsx)(`section`,{className:`flex items-center justify-center px-5 py-10 sm:px-10 lg:order-1 lg:px-14 lg:py-12`,children:(0,_.jsxs)(`div`,{className:`w-full max-w-md`,children:[(0,_.jsxs)(r,{to:`/`,className:`mb-6 flex items-center justify-center gap-2.5`,children:[(0,_.jsx)(o,{className:`h-10 w-16`}),(0,_.jsx)(`span`,{className:`font-display text-lg font-bold`,children:`WISO`})]}),(0,_.jsxs)(`div`,{className:`mb-5 text-center`,children:[(0,_.jsx)(`h1`,{className:`font-display text-2xl font-extrabold`,children:`يلا نبدأ ونخلص اللي ورانا`}),(0,_.jsx)(`p`,{className:`mt-1.5 text-sm text-muted-foreground`,children:`دخول واحد، وبعدها خطة المعركة والأسئلة التقيلة.`})]}),(0,_.jsxs)(`div`,{className:`surface-panel p-6`,children:[(0,_.jsx)(c,{type:`button`,variant:`outline`,className:`mb-4 w-full`,disabled:t,onClick:D,children:`الدخول بحساب Google`}),(0,_.jsxs)(`div`,{className:`mb-4 flex items-center gap-3 text-xs text-muted-foreground`,children:[(0,_.jsx)(`span`,{className:`h-px flex-1 bg-border`}),`أو بالإيميل`,(0,_.jsx)(`span`,{className:`h-px flex-1 bg-border`})]}),(0,_.jsxs)(h,{defaultValue:`login`,children:[(0,_.jsxs)(m,{className:`grid w-full grid-cols-2`,children:[(0,_.jsx)(f,{value:`login`,children:`دخول`}),(0,_.jsx)(f,{value:`register`,children:`حساب جديد`})]}),(0,_.jsx)(p,{value:`login`,className:`mt-5`,children:(0,_.jsxs)(`form`,{onSubmit:w,className:`space-y-4`,children:[(0,_.jsxs)(`div`,{className:`space-y-2`,children:[(0,_.jsx)(l,{htmlFor:`login-email`,children:`الإيميل`}),(0,_.jsx)(d,{id:`login-email`,type:`email`,dir:`ltr`,required:!0,value:v,onChange:e=>y(e.target.value)})]}),(0,_.jsxs)(`div`,{className:`space-y-2`,children:[(0,_.jsx)(l,{htmlFor:`login-password`,children:`الباسورد`}),(0,_.jsx)(d,{id:`login-password`,type:`password`,dir:`ltr`,required:!0,value:b,onChange:e=>x(e.target.value)})]}),(0,_.jsx)(c,{type:`submit`,className:`w-full`,disabled:t,children:t?`لحظة...`:`يلا ندخل`}),(0,_.jsx)(`button`,{type:`button`,onClick:E,className:`w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline`,children:`نسيت الباسورد؟`})]})}),(0,_.jsx)(p,{value:`register`,className:`mt-5`,children:(0,_.jsxs)(`form`,{onSubmit:T,className:`space-y-4`,children:[(0,_.jsxs)(`div`,{className:`space-y-2`,children:[(0,_.jsx)(l,{htmlFor:`reg-name`,children:`اسمك بالكامل`}),(0,_.jsx)(d,{id:`reg-name`,required:!0,value:S,onChange:e=>C(e.target.value)})]}),(0,_.jsxs)(`div`,{className:`space-y-2`,children:[(0,_.jsx)(l,{htmlFor:`reg-email`,children:`الإيميل`}),(0,_.jsx)(d,{id:`reg-email`,type:`email`,dir:`ltr`,required:!0,value:v,onChange:e=>y(e.target.value)})]}),(0,_.jsxs)(`div`,{className:`space-y-2`,children:[(0,_.jsx)(l,{htmlFor:`reg-password`,children:`الباسورد`}),(0,_.jsx)(d,{id:`reg-password`,type:`password`,dir:`ltr`,required:!0,minLength:8,value:b,onChange:e=>x(e.target.value)})]}),(0,_.jsx)(c,{type:`submit`,className:`w-full`,disabled:t,children:t?`لحظة...`:`اعمل حسابي`}),(0,_.jsx)(`p`,{className:`text-center text-xs text-muted-foreground`,children:`هتاخد كود طالب خاص بيك و40 سؤال مجاني 24 ساعة.`})]})})]})]})]})}),(0,_.jsxs)(`section`,{className:`
    hero-glow
    relative
    flex
    items-center
    justify-center
    overflow-hidden
    px-5
    pb-10
    pt-8
    sm:px-8
    sm:pb-12
    lg:order-2
    lg:px-10
    lg:py-10
  `,children:[(0,_.jsx)(`div`,{"aria-hidden":`true`,className:`app-grid pointer-events-none absolute inset-0`}),(0,_.jsx)(`div`,{"aria-hidden":`true`,className:`
      pointer-events-none
      absolute
      inset-0
      bg-gradient-to-br
      from-primary/10
      via-transparent
      to-primary/5
    `}),(0,_.jsx)(`div`,{className:`relative z-10 w-full max-w-2xl`,children:(0,_.jsx)(`div`,{className:`
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border/60
        bg-card
        p-2
        shadow-2xl
        shadow-black/10
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-black/15
        sm:p-3
      `,children:(0,_.jsx)(`div`,{className:`relative overflow-hidden rounded-[1.35rem] bg-muted`,children:(0,_.jsx)(`img`,{src:`/wiso-agent-auth.png`,alt:`WISO Agent`,className:`
            block
            h-auto
            w-full
            object-contain
            transition-transform
            duration-700
            group-hover:scale-[1.015]
          `})})})})]})]}),(0,_.jsx)(u,{})]})}export{v as component};