import { l as createServerFn } from "./createServerFn-yTfeHp1H.mjs";
import { t as requireSupabaseAdmin } from "./auth-middleware-BogctHY4.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Ce7g1tLo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-DKdO8Tg0.js
/**
* Secure server-side seam for WISO administrator operations.
*
* IMPORTANT:
* - Browser code may import these createServerFn wrappers safely.
* - The service-role credential never reaches the browser.
* - Every operation is protected by requireSupabaseAdmin.
* - Admin identity comes from context.adminId, derived from the
*   authenticated user's JWT. It is never supplied by the browser.
*/
var adminGetPdfSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("dacb61c79db7cb80219b4c046f49830f7609ade685e3d833379601718535ebe6"));
var adminUpdatePdfSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("fbc91ad9056fe34977f3c944c4f05c629e6ee135166b7fcd7017b66d2e96951a"));
var adminGetPlatformSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("e6e9aa20a20ef205576a717347fad397b8599eae4856abd35f5f41891ada63a3"));
var adminUpdatePlatformSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("8f7b62db00d95a3242676095337bd3e121f15dc04ac9e66701dbad9fa6a44dbd"));
var adminGetContestSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("e9914173aa76aff78cf54d15d65c6c8a1788b73a1c6c525c56b268abb4c6f59d"));
var adminGetContestEntriesCount = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("ede7008e77697f81784f36a335b4fdb4c8e47511cb18621d4c6074f748b22864"));
var adminUpdateContestSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("3e12da166ba3fa88bcce8b294f92ae56ecbc5b78b6fb252f73fc634eb70e13d0"));
var adminGetRevenueSummary = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("9de661ed26ca37a3ac5fc5c4596bda37f5f97ad7588b8409b51153c222d6ee72"));
var adminGetAiSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("4fc1e12191c0448732f71857e18d8250c31fea217dfabd02d1e660cffe8fe064"));
var adminUpdateAiSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("ffa861d4c6cec580e7da69da12f56b4b33f8b2cf89c6f0ec42952080e39a69b4"));
var adminGetCenters = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("bcfa4b57feb6408720ea2170df6d997564c479278d2f25e3520bdb6b13f6e78c"));
var adminGetPlans = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("ed033bdf38e65d9eedbb52d1f49483afc81b4a4979eb201b9221ef9580c4b025"));
var adminGetCenterCodes = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("682bb3d5f433e0abbd462f7bed1b092acb95c9752196f6fdf7cfa24ec56c2417"));
var adminCreateCenter = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("1ceecc5b98903ff2db375d1e4b25cbf77239a7ffd3ce458240d6a3cf625202d9"));
var adminGenerateCenterCodes = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("4d7d4e947255edb3c088418e2a1480a080eee5f5544d3f880e7c34f6dbff9be8"));
var adminGetStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("4d34f4e948b3272ac451a0f7db93c6b0a0c9619794d4dd673c4ed42c5e7eeee5"));
var adminGetDashboardCounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("cab6e0da7b6324cec0f76065f84076fd7105ed20c3669d90f3e098bb01148014"));
var adminListUsers = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("35cf6cc28f61c798a570ec39672552de8ed250f60706565e25b34a66f0c5b240"));
var adminGetUserDetail = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("c6aebd0cde54dfb0c41e0efbdc86e4a6d2f069048797740c2c9bb8e8a44c16fd"));
var adminGrantAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("f4476c1251ed84beaa56cc46d20f8a8aa5dec4d69fe7815545a4a6811ac05d09"));
var adminRevokeAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("a090998c225a5a28a4e94419fcd0e1ae0fcba5893dfe2bd5d00e335ae387fea9"));
var adminSetSuspended = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("a05ff7a70de516ddebe17803c5fe7fe53655d9b62cef6d469443d0364aa8dd1e"));
var adminManageTrial = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("e9baaa745e71f5c5805252640110d0896be882193bf5ca87f41965a54982050e"));
var adminSetRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("154da85bc7e5915df5164155bbb68a97441082079312d44aab513dabc82f59c3"));
var adminGetPayments = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("783d1413fe2bbf8624252af4de15cca3f56cc95988413401668f8e36b75427eb"));
var adminReviewPayment = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("8db6486cfeed8cc4e2082c52285ad5af0c5cebafde1b3ad5f715d5fbde750b57"));
var adminGetPaymentProofUrl = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("411208c8dbba189a2c50db7bbe8c5d01bd8300b6408967450a1cc2925e2a4e67"));
var adminGetSpecialRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("53cb86894b1d38473795042a1b48ce63f8f3dd31f3d2093db4aa214dfd5817f4"));
var adminReviewSpecialRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("9bf004a9e27b93e18f05889e812c12226368d26fad02245baa1724082348c0b5"));
var adminGetAiStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("93e4a9b1864ed3e5b6ab3d4759997fe3a084dc7ad9d4eb737b10a82bd0e56d9c"));
var adminGetAiJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("6bde7419c6d290ece9b455da9530b78f1393bf13e4ee994a686746de5fbbe90e"));
var adminGetAiLogs = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("bbd79d37de23fd008e0617ebb5cfbbfa6cadb2770300a580216496318c3a8a49"));
var adminGetSubjects = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("7d48b53c4f8672f3e01f1e553abef04532c9ddec8829d42938a642937a9486d9"));
var adminGetCurriculumContentCounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("1dbb75d01c95bb1ef0823a2f14010fe213a23d2b2aa099602275b4c183ebb43b"));
var adminCreateSubject = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("3c095e39fbd36c4e50261a88eed2b004cf05d4087287bfb2fe8130a614a9e7ad"));
var adminUpdateSubject = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("728a1acdb9f8094e0b2634e7246e1ea1ffa07d9737a4ef52f17cb04c2ad386ff"));
var adminUpdateSubscriptionPlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("4f5caf88181eb6303abe042e694ecc3416bd43fbeb5b113799a92ba3743046db"));
var adminCreateSubscriptionPlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("e2e7eb84bdc572628ca2ed482026d72e11aad0f2809a574e38c77e12e9e58a2e"));
var adminGetSubscriptionPlans = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("f89f3eefd20e23378ebaf6782a4be7bc0a1ea3c214f645aa46869503f005ce69"));
var adminGetQuestionSubjects = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("1382a06fd14c4eda2614f61aa3a63bab3b7775ef55090ae30f881c9df9616ab4"));
var adminGetQuestionBank = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("74e4e36e629a3b8d301b1d8befec2381abc9217061b0bb937348edc1359d2304"));
var adminPrepareCurriculumUpload = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("92e4105056011fa6f746cb9f3626016fee62baa999e9f168cb075eb9239e2b07"));
var adminProcessCurriculum = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("971eb9807ba60a8d7a51f2987f350040c838b51405413c247fea66b6dbc24437"));
var adminGetCurriculumVersions = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("ea9efd495f9d2f09d5c0b3724f44e427a358cc5b92d349d58f0fab33aff17f79"));
var adminPublishCurriculumVersion = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("a6706d06ffc120f16d5fb07f74f8e6d71f4809a41e92be4dbd9e81c7321aca37"));
var adminSendNotification = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("2ce335996f2b07a5db45e1394010b15094588b453097d464a8e3d8f8b1ac8a00"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("6418debdc43746869f80d83965aa6cfd8b0d546d7e1732e01fa148279949b5f2"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("65bdf57ca9c822586ab3fb39954614cec659f50737c646ea5596027fa21bb234"));
//#endregion
export { adminListUsers as A, adminSetSuspended as B, adminGetRevenueSummary as C, adminGetSubscriptionPlans as D, adminGetSubjects as E, adminReviewPayment as F, adminUpdateSubject as G, adminUpdateContestSettings as H, adminReviewSpecialRequest as I, adminUpdateSubscriptionPlan as K, adminRevokeAccess as L, adminPrepareCurriculumUpload as M, adminProcessCurriculum as N, adminGetUserDetail as O, adminPublishCurriculumVersion as P, adminSendNotification as R, adminGetQuestionSubjects as S, adminGetStats as T, adminUpdatePdfSettings as U, adminUpdateAiSettings as V, adminUpdatePlatformSettings as W, adminGetPayments as _, adminGetAiJobs as a, adminGetPlatformSettings as b, adminGetAiStats as c, adminGetContestEntriesCount as d, adminGetContestSettings as f, adminGetPaymentProofUrl as g, adminGetDashboardCounts as h, adminGenerateCenterCodes as i, adminManageTrial as j, adminGrantAccess as k, adminGetCenterCodes as l, adminGetCurriculumVersions as m, adminCreateSubject as n, adminGetAiLogs as o, adminGetCurriculumContentCounts as p, adminCreateSubscriptionPlan as r, adminGetAiSettings as s, adminCreateCenter as t, adminGetCenters as u, adminGetPdfSettings as v, adminGetSpecialRequests as w, adminGetQuestionBank as x, adminGetPlans as y, adminSetRole as z };
