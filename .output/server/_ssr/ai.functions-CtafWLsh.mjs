import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
import { t as createSsrRpc } from "./createSsrRpc-lwvUPFNu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-CtafWLsh.js
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("eb2ee64070a95f5ca231302b02ebc4033bc4338affec0d905e7b745c92a76c32"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("0e55671fb33596161d4fe6e784132040d22a107057638e765de8505129b5aaaa"));
var aiGenerateQuestionBatch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("531b40aad68bab08e101058a41eac00e88bbe1df0a9dcdc2cf33d2357a35a2fa"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("9f12c18ce2aef915f802abb099c03cd446cbb12604432ff0d4fe13530b402eb2"));
var aiGeneratePlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("4129f48ba34c4a7887ada04e32f14dc3e638686a378b9fe5df2bd9b5e7c75a68"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("2a3d37311a0e943084adad332ff1487ff8e6d6204f9f6de7934d667f32d779be"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("8f3a73f2e9c9439a2143581228810e980502d64a1c4f69be0a2f1386ab1be0c5"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("846d7caffc75172e18ded6d0c28e7eb857209661a6ced675cb76576f67d89dc9"));
/** Secure personalized PDF export. This performs no AI call. */
var exportQuestionPdf = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("3b79787354a6069758866c30d434dc4df383e4f022b85d182fe72e580dafa8b0"));
//#endregion
export { aiGenerateQuestionBatch as n, exportQuestionPdf as r, aiGeneratePlan as t };
