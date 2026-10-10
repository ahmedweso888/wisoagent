globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/activity-DjASkSWb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ea-KvgWQkIWoMnI1fUnFr1Y2dlnh28\"",
		"mtime": "2026-10-06T19:41:42.527Z",
		"size": 234,
		"path": "../public/assets/activity-DjASkSWb.js"
	},
	"/assets/admin.center-requests-CkeO-XkE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab1-z3zLZRQ17E0Y3nqNwwXsWV0HrOI\"",
		"mtime": "2026-10-06T19:41:42.530Z",
		"size": 2737,
		"path": "../public/assets/admin.center-requests-CkeO-XkE.js"
	},
	"/assets/admin.ai-D3viXs9t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1122-MnCCAazJTfEP1pB4iuY+ixMKCok\"",
		"mtime": "2026-10-06T19:41:42.528Z",
		"size": 4386,
		"path": "../public/assets/admin.ai-D3viXs9t.js"
	},
	"/assets/admin.centers-Don3-gls.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ba4-5k6WS+LaiN20+Kvp6gMYejFXfrQ\"",
		"mtime": "2026-10-06T19:41:42.530Z",
		"size": 7076,
		"path": "../public/assets/admin.centers-Don3-gls.js"
	},
	"/assets/admin.curriculum-DJwUlhRf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"222a-IlTqVQjgcFxmZAkw34TcTvixOTA\"",
		"mtime": "2026-10-06T19:41:42.531Z",
		"size": 8746,
		"path": "../public/assets/admin.curriculum-DJwUlhRf.js"
	},
	"/assets/admin.bundles-gJF9d7c6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16af-NdS5ZQcGJwmZ+s6vjY9RwamD+pc\"",
		"mtime": "2026-10-06T19:41:42.529Z",
		"size": 5807,
		"path": "../public/assets/admin.bundles-gJF9d7c6.js"
	},
	"/assets/admin.index-BJN9PaeM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15f2-wLh1k6VUvgkSFTY2W7OLM7g+mBs\"",
		"mtime": "2026-10-06T19:41:42.533Z",
		"size": 5618,
		"path": "../public/assets/admin.index-BJN9PaeM.js"
	},
	"/assets/admin.jobs-D_Umsad3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"161f-1PoRdy5ZYPums1NsRPYap33J418\"",
		"mtime": "2026-10-06T19:41:42.534Z",
		"size": 5663,
		"path": "../public/assets/admin.jobs-D_Umsad3.js"
	},
	"/assets/admin.functions-2RGwFtGs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"174b-7WAjTYTFB8DagnGWKqzjJ8pPeEA\"",
		"mtime": "2026-10-06T19:41:42.532Z",
		"size": 5963,
		"path": "../public/assets/admin.functions-2RGwFtGs.js"
	},
	"/assets/admin.middleware-DIJDmUp8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94-Gu3G9V4oTWkpx3poTh0pDeUm45w\"",
		"mtime": "2026-10-06T19:41:42.534Z",
		"size": 148,
		"path": "../public/assets/admin.middleware-DIJDmUp8.js"
	},
	"/assets/admin.payments-C6HeH2Py.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12a1-TKsMBiON3Y0OSDNya9cJSOPn7P8\"",
		"mtime": "2026-10-06T19:41:42.535Z",
		"size": 4769,
		"path": "../public/assets/admin.payments-C6HeH2Py.js"
	},
	"/assets/admin.requests-CzDUF2g1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e68-hIVDd4LubxxnhSy7NVX5uS5lWS4\"",
		"mtime": "2026-10-06T19:41:42.537Z",
		"size": 3688,
		"path": "../public/assets/admin.requests-CzDUF2g1.js"
	},
	"/assets/admin.questions-CA4ARJH_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"142e-+RAySEWJkGUWJyESTu+K85GiDlM\"",
		"mtime": "2026-10-06T19:41:42.536Z",
		"size": 5166,
		"path": "../public/assets/admin.questions-CA4ARJH_.js"
	},
	"/assets/admin.sprix-CkGD7GV6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b65-W6b3NLHEKQkd4CvEWZLbqIFIhH8\"",
		"mtime": "2026-10-06T19:41:42.538Z",
		"size": 7013,
		"path": "../public/assets/admin.sprix-CkGD7GV6.js"
	},
	"/assets/admin.system-ClJZ9J4u.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"29ed-OlQHKyxm52iwn1wshV5ArjC839E\"",
		"mtime": "2026-10-06T19:41:42.540Z",
		"size": 10733,
		"path": "../public/assets/admin.system-ClJZ9J4u.js"
	},
	"/assets/admin.students-AbT0wn0X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3193-3qB2opPjAfw+zHIUgdhuK4aCKWs\"",
		"mtime": "2026-10-06T19:41:42.539Z",
		"size": 12691,
		"path": "../public/assets/admin.students-AbT0wn0X.js"
	},
	"/assets/admin.tools-BmZgmN-l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"150c-c+W8uCwpEryfIeFBmAx2FBdzlc4\"",
		"mtime": "2026-10-06T19:41:42.541Z",
		"size": 5388,
		"path": "../public/assets/admin.tools-BmZgmN-l.js"
	},
	"/assets/arrow-left-Bg--rWLm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-01DcNJd1XeTfQyDOi1/MP9gxUUI\"",
		"mtime": "2026-10-06T19:41:42.542Z",
		"size": 165,
		"path": "../public/assets/arrow-left-Bg--rWLm.js"
	},
	"/assets/ai.functions-CUxFhIGd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"491-1EBd7d4GuEqLoti9IuRmYK699fM\"",
		"mtime": "2026-10-06T19:41:42.541Z",
		"size": 1169,
		"path": "../public/assets/ai.functions-CUxFhIGd.js"
	},
	"/assets/auth-BWWBtHAf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1912-eqcwd+C84+QmtrInYSQ6gEanlcc\"",
		"mtime": "2026-10-06T19:41:42.543Z",
		"size": 6418,
		"path": "../public/assets/auth-BWWBtHAf.js"
	},
	"/assets/auth-middleware-FKtkAEej.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"117a-hOop2qlF8TuQGD47FwBQlHm/3w0\"",
		"mtime": "2026-10-06T19:41:42.544Z",
		"size": 4474,
		"path": "../public/assets/auth-middleware-FKtkAEej.js"
	},
	"/بريميوم لوجو ويسو ايجنت.png": {
		"type": "image/png",
		"etag": "\"fed6b-NxXNYa8hUof/e2YFWu/iuvuzGAM\"",
		"mtime": "2026-08-30T09:07:51.586Z",
		"size": 1043819,
		"path": "../public/بريميوم لوجو ويسو ايجنت.png"
	},
	"/favicon.png": {
		"type": "image/png",
		"etag": "\"12e40e-f8G8r/VbcaHqtuSYC0iEHHD9sSE\"",
		"mtime": "2026-09-19T04:45:34.857Z",
		"size": 1238030,
		"path": "../public/favicon.png"
	},
	"/لودنج بيج.png": {
		"type": "image/png",
		"etag": "\"16734e-th6gj8zmTT2wSVWwLEGAyS/EA6U\"",
		"mtime": "2026-09-15T02:28:23.090Z",
		"size": 1471310,
		"path": "../public/لودنج بيج.png"
	},
	"/assets/badge-DpaYlolb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"309-Il0xZwC7KyBczBug8ZfQG9j2SnI\"",
		"mtime": "2026-10-06T19:41:42.545Z",
		"size": 777,
		"path": "../public/assets/badge-DpaYlolb.js"
	},
	"/assets/book-open-check-CrVjIoC8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14f-CGlgi8pcx7qgXQMVp8Q7RwQBvL4\"",
		"mtime": "2026-10-06T19:41:42.547Z",
		"size": 335,
		"path": "../public/assets/book-open-check-CrVjIoC8.js"
	},
	"/assets/badge-check-Dsjxda--.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-vCFLBupdmbkify2+xupPvf1K+ig\"",
		"mtime": "2026-10-06T19:41:42.546Z",
		"size": 316,
		"path": "../public/assets/badge-check-Dsjxda--.js"
	},
	"/assets/bot-4NA0KJ6G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-LnqIIJDviQeosKDmFYXDbBx4KCc\"",
		"mtime": "2026-10-06T19:41:42.547Z",
		"size": 328,
		"path": "../public/assets/bot-4NA0KJ6G.js"
	},
	"/assets/button-siwNbNPf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7dd-zV8ec4fuMYg15Sc9IYSMci1t3Ns\"",
		"mtime": "2026-10-06T19:41:42.549Z",
		"size": 2013,
		"path": "../public/assets/button-siwNbNPf.js"
	},
	"/assets/building-2-DlZyMBkq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17f-tR0C6Re4Iax2mcsh24vfKKr0Di4\"",
		"mtime": "2026-10-06T19:41:42.548Z",
		"size": 383,
		"path": "../public/assets/building-2-DlZyMBkq.js"
	},
	"/assets/card-Dr2VwdXL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"44a-c5m+THr0Qm4uxZcJQna9ngiO6W4\"",
		"mtime": "2026-10-06T19:41:42.550Z",
		"size": 1098,
		"path": "../public/assets/card-Dr2VwdXL.js"
	},
	"/assets/center-request-jeM-AsW6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8da-t848Bh858chsVW4JYuirA3dxEAw\"",
		"mtime": "2026-10-06T19:41:42.551Z",
		"size": 2266,
		"path": "../public/assets/center-request-jeM-AsW6.js"
	},
	"/assets/center-request.functions-D7zfJU7p.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"285-Irp+TmXS/BWcwnBZoX07nFaCMVE\"",
		"mtime": "2026-10-06T19:41:42.551Z",
		"size": 645,
		"path": "../public/assets/center-request.functions-D7zfJU7p.js"
	},
	"/assets/circle-check-Cio-Ez7v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-OL+8nS7cabZHdXpXeQ2Omc/fB/Q\"",
		"mtime": "2026-10-06T19:41:42.554Z",
		"size": 178,
		"path": "../public/assets/circle-check-Cio-Ez7v.js"
	},
	"/assets/check-CAjzqsDR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7c-kPU8yuBDe1seV9lo+KNimfJ0hQM\"",
		"mtime": "2026-10-06T19:41:42.552Z",
		"size": 124,
		"path": "../public/assets/check-CAjzqsDR.js"
	},
	"/assets/circle-alert-fwXwmRfm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fa-UoWgrkXeZKhhYp7yTXAAikJJCkA\"",
		"mtime": "2026-10-06T19:41:42.553Z",
		"size": 250,
		"path": "../public/assets/circle-alert-fwXwmRfm.js"
	},
	"/assets/circle-stop-Dr8i7Cp4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c7-I1P1DLSsk0tlUTc4lhlDi4MSKd4\"",
		"mtime": "2026-10-06T19:41:42.555Z",
		"size": 199,
		"path": "../public/assets/circle-stop-Dr8i7Cp4.js"
	},
	"/wiso-agent-auth.png": {
		"type": "image/png",
		"etag": "\"2267cf-54Lq3kRCq2NWu7MxC80ROe+J1GI\"",
		"mtime": "2026-09-24T10:49:44.375Z",
		"size": 2254799,
		"path": "../public/wiso-agent-auth.png"
	},
	"/assets/Combination-Crwm4FVw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"55ad-Qhch41PXzqr49QKQedvZfeCVy20\"",
		"mtime": "2026-10-06T19:41:42.524Z",
		"size": 21933,
		"path": "../public/assets/Combination-Crwm4FVw.js"
	},
	"/assets/createLucideIcon-C_LCJTxh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ab-O9+czQKFHMACYTYdFrR18PV0PjE\"",
		"mtime": "2026-10-06T19:41:42.555Z",
		"size": 1195,
		"path": "../public/assets/createLucideIcon-C_LCJTxh.js"
	},
	"/assets/dashboard-D6DynJjK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1461-3bpc+44SrNyLpRlQv6L0ehA5Gmg\"",
		"mtime": "2026-10-06T19:41:42.556Z",
		"size": 5217,
		"path": "../public/assets/dashboard-D6DynJjK.js"
	},
	"/assets/dist-BjJEvfsS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6e1-qPRZQN7XGKuC0mIB393GgVI2XqY\"",
		"mtime": "2026-10-06T19:41:42.557Z",
		"size": 1761,
		"path": "../public/assets/dist-BjJEvfsS.js"
	},
	"/assets/dist-C39SsvBQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"124-UyE8aep+EOZ+wLN460rutgxuWwI\"",
		"mtime": "2026-10-06T19:41:42.558Z",
		"size": 292,
		"path": "../public/assets/dist-C39SsvBQ.js"
	},
	"/assets/dist-Bk159rMc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"83-AbWO7RD3vpxH/fWAh62KA2tu80M\"",
		"mtime": "2026-10-06T19:41:42.557Z",
		"size": 131,
		"path": "../public/assets/dist-Bk159rMc.js"
	},
	"/assets/dist-CF05PMUH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27f-NTuTxrLLNpWXFYpfFB5S6I0ZeKY\"",
		"mtime": "2026-10-06T19:41:42.559Z",
		"size": 639,
		"path": "../public/assets/dist-CF05PMUH.js"
	},
	"/assets/dist-CWLky9Ub.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3c-/gDNYB7ZR75TeblvuTYdC7vQdmI\"",
		"mtime": "2026-10-06T19:41:42.560Z",
		"size": 2876,
		"path": "../public/assets/dist-CWLky9Ub.js"
	},
	"/assets/dist-CYG8iZcR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c9d-WQA3X/e90ooflJ334EhEFPu3KFA\"",
		"mtime": "2026-10-06T19:41:42.560Z",
		"size": 7325,
		"path": "../public/assets/dist-CYG8iZcR.js"
	},
	"/assets/dist-DBs2LdRP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b96-X/zJIFD1/o78Sm/GFJtGTt2uiCE\"",
		"mtime": "2026-10-06T19:41:42.561Z",
		"size": 2966,
		"path": "../public/assets/dist-DBs2LdRP.js"
	},
	"/assets/dist-DvIX1lUA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c3-wPZBVWoC9mslx/DPsoHB8Lzu+J0\"",
		"mtime": "2026-10-06T19:41:42.562Z",
		"size": 707,
		"path": "../public/assets/dist-DvIX1lUA.js"
	},
	"/assets/external-link-DCipr1SV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb-j9x7eo2t9MlsfMKbvTK/q7mc044\"",
		"mtime": "2026-10-06T19:41:42.564Z",
		"size": 251,
		"path": "../public/assets/external-link-DCipr1SV.js"
	},
	"/assets/dist-mvmvUu9A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a58-xVRH5fDXS4cltvbv55xAp+f8iEw\"",
		"mtime": "2026-10-06T19:41:42.563Z",
		"size": 2648,
		"path": "../public/assets/dist-mvmvUu9A.js"
	},
	"/assets/dist-FrysYUAZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1345-DTJrr/gvJWbzbxrlxdyVmQfee3A\"",
		"mtime": "2026-10-06T19:41:42.562Z",
		"size": 4933,
		"path": "../public/assets/dist-FrysYUAZ.js"
	},
	"/assets/EmptyState-bGx1qtCK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"329-le6sBRAAn2pcwERs68UQbwJ6xjI\"",
		"mtime": "2026-10-06T19:41:42.524Z",
		"size": 809,
		"path": "../public/assets/EmptyState-bGx1qtCK.js"
	},
	"/assets/file-clock-BOzs_wY0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"167-YHW9K9XVidaXSMF706oTApH91Do\"",
		"mtime": "2026-10-06T19:41:42.564Z",
		"size": 359,
		"path": "../public/assets/file-clock-BOzs_wY0.js"
	},
	"/assets/Footer-Dtyra6UZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1927-/pEahYEao/vjl0lRcpPJMxB/ePs\"",
		"mtime": "2026-10-06T19:41:42.525Z",
		"size": 6439,
		"path": "../public/assets/Footer-Dtyra6UZ.js"
	},
	"/assets/generate-CIjr0qeI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c7e-zB0KG7+ZraXOuianXeBwfqGFf4g\"",
		"mtime": "2026-10-06T19:41:42.565Z",
		"size": 11390,
		"path": "../public/assets/generate-CIjr0qeI.js"
	},
	"/assets/input-CmbQ3VMt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2af-tixGF9EBVDV3revQzerFUQbfdZk\"",
		"mtime": "2026-10-06T19:41:42.565Z",
		"size": 687,
		"path": "../public/assets/input-CmbQ3VMt.js"
	},
	"/assets/invite._code-D18vp01C.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2f5-JIoZpww549ELLvtlieOmymxKkmM\"",
		"mtime": "2026-10-06T19:41:42.566Z",
		"size": 757,
		"path": "../public/assets/invite._code-D18vp01C.js"
	},
	"/assets/key-round-D_R5ZEqS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"163-xVv79rskI5WcsfXTWHoP2ikRr4A\"",
		"mtime": "2026-10-06T19:41:42.568Z",
		"size": 355,
		"path": "../public/assets/key-round-D_R5ZEqS.js"
	},
	"/assets/label-9ifzNZtS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cf-MsYfv9pzOgEFvWDbVfuzlquu8wY\"",
		"mtime": "2026-10-06T19:41:42.568Z",
		"size": 719,
		"path": "../public/assets/label-9ifzNZtS.js"
	},
	"/assets/jsx-runtime-Dk72oS4N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2246-jdmifwUklrWzVvkkm/k29uuTwFE\"",
		"mtime": "2026-10-06T19:41:42.567Z",
		"size": 8774,
		"path": "../public/assets/jsx-runtime-Dk72oS4N.js"
	},
	"/assets/library-CwFdObfE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e6-wLWXod6oJbetcS6DYB447dVjfMA\"",
		"mtime": "2026-10-06T19:41:42.569Z",
		"size": 230,
		"path": "../public/assets/library-CwFdObfE.js"
	},
	"/assets/loader-circle-CT4tTHMc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"90-Yf+XjUKAnu/4opPSZ58r8SmVE+I\"",
		"mtime": "2026-10-06T19:41:42.569Z",
		"size": 144,
		"path": "../public/assets/loader-circle-CT4tTHMc.js"
	},
	"/assets/lock-keyhole-C4HlfLMn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-nYtT2kXeQEqLlT9+JGz/qMAfvtk\"",
		"mtime": "2026-10-06T19:41:42.570Z",
		"size": 255,
		"path": "../public/assets/lock-keyhole-C4HlfLMn.js"
	},
	"/assets/menu-UPCulqa8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bd-auu4q2wMb2IkJZ8JGzSZ1/fvauA\"",
		"mtime": "2026-10-06T19:41:42.571Z",
		"size": 189,
		"path": "../public/assets/menu-UPCulqa8.js"
	},
	"/assets/notifications-BnPH7ctP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"976-aR84MhsS3vOexYa5YocaSctRKmo\"",
		"mtime": "2026-10-06T19:41:42.572Z",
		"size": 2422,
		"path": "../public/assets/notifications-BnPH7ctP.js"
	},
	"/assets/index-DxNCYioU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a6226-coG9h6ctYlI1xyTJ5668oSdIJMU\"",
		"mtime": "2026-10-06T19:41:42.523Z",
		"size": 680486,
		"path": "../public/assets/index-DxNCYioU.js"
	},
	"/assets/onboarding-CQIQ_gIc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1a-Shsn/c1dtKk+0Ip5bgbeWRDMixs\"",
		"mtime": "2026-10-06T19:41:42.572Z",
		"size": 3354,
		"path": "../public/assets/onboarding-CQIQ_gIc.js"
	},
	"/assets/package-2PXSjMVl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"174-KoUg/kQFp07DfbfCu+7kGH7AI4M\"",
		"mtime": "2026-10-06T19:41:42.573Z",
		"size": 372,
		"path": "../public/assets/package-2PXSjMVl.js"
	},
	"/assets/PageHeader-C7HG9c_A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"284-K3HfAROxV7Vzl+plM1emOtScXww\"",
		"mtime": "2026-10-06T19:41:42.526Z",
		"size": 644,
		"path": "../public/assets/PageHeader-C7HG9c_A.js"
	},
	"/assets/plan-CJMDjHJp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"142c-wusIqnTp+j69Twh5TAsPd8oTWMw\"",
		"mtime": "2026-10-06T19:41:42.574Z",
		"size": 5164,
		"path": "../public/assets/plan-CJMDjHJp.js"
	},
	"/assets/profile-DtJ07Tvl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3280-qJZp6rUWW2y30oamLD3QFWf1E4w\"",
		"mtime": "2026-10-06T19:41:42.575Z",
		"size": 12928,
		"path": "../public/assets/profile-DtJ07Tvl.js"
	},
	"/assets/progress-BC5RHNYK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8f1-mamo+RjEtT3JlylOu904kjcXlEE\"",
		"mtime": "2026-10-06T19:41:42.575Z",
		"size": 2289,
		"path": "../public/assets/progress-BC5RHNYK.js"
	},
	"/assets/qureo-DhEvGG5D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"173f-QciB24i7BR0yxpNJymAl+WNkL9U\"",
		"mtime": "2026-10-06T19:41:42.576Z",
		"size": 5951,
		"path": "../public/assets/qureo-DhEvGG5D.js"
	},
	"/assets/referral.functions-BGJ4nVBU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c8-zKayiN3ihFdDOKsg77QYJz5oDgY\"",
		"mtime": "2026-10-06T19:41:42.577Z",
		"size": 456,
		"path": "../public/assets/referral.functions-BGJ4nVBU.js"
	},
	"/assets/refresh-cw-Dog8qxKe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"141-bVOn0cqhv/wc12+2anQe8O4lIqg\"",
		"mtime": "2026-10-06T19:41:42.579Z",
		"size": 321,
		"path": "../public/assets/refresh-cw-Dog8qxKe.js"
	},
	"/assets/react-dom-CxAQt2Ay.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f17-pkyc8i9fR8ycdAMyclNWgBjMoyQ\"",
		"mtime": "2026-10-06T19:41:42.577Z",
		"size": 3863,
		"path": "../public/assets/react-dom-CxAQt2Ay.js"
	},
	"/assets/requests-BEO5QsPc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d84-QNyy4VY5BNudFI+9BIlrxOR5lMU\"",
		"mtime": "2026-10-06T19:41:42.579Z",
		"size": 3460,
		"path": "../public/assets/requests-BEO5QsPc.js"
	},
	"/assets/route-DraVzFDV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a6a-pOIFp+MD1cEnQYRWfbQJjfslqXE\"",
		"mtime": "2026-10-06T19:41:42.580Z",
		"size": 6762,
		"path": "../public/assets/route-DraVzFDV.js"
	},
	"/assets/settings-BLP6kytX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"984-XbhAoj8sOrrSfUk/eEOtpd67M9A\"",
		"mtime": "2026-10-06T19:41:42.582Z",
		"size": 2436,
		"path": "../public/assets/settings-BLP6kytX.js"
	},
	"/assets/select-BjIjuXGn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bba1-Zq8eFdfDRBc5IiuNdh2es0p9Ino\"",
		"mtime": "2026-10-06T19:41:42.581Z",
		"size": 48033,
		"path": "../public/assets/select-BjIjuXGn.js"
	},
	"/assets/shield-check-CYIDD2sb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"140-/8RrycWmkeYHtAQ3kBFYkgeXzHg\"",
		"mtime": "2026-10-06T19:41:42.583Z",
		"size": 320,
		"path": "../public/assets/shield-check-CYIDD2sb.js"
	},
	"/assets/skeleton-spENAOof.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e4-mom4DnBxT2/IU4o89Y84FJZ1qbQ\"",
		"mtime": "2026-10-06T19:41:42.583Z",
		"size": 228,
		"path": "../public/assets/skeleton-spENAOof.js"
	},
	"/assets/routes-C-B64anZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22f16-1fW0DbEDujb+TmgXWXKpHU4tN4o\"",
		"mtime": "2026-10-06T19:41:42.581Z",
		"size": 143126,
		"path": "../public/assets/routes-C-B64anZ.js"
	},
	"/assets/sparkles-2pwJeH60.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee-ft673Txx+SctDtfyeKfP+TvT/+s\"",
		"mtime": "2026-10-06T19:41:42.584Z",
		"size": 494,
		"path": "../public/assets/sparkles-2pwJeH60.js"
	},
	"/assets/StatCard-CIEsHFPB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ac-rVu7INU4vuCtIX8X73uGV6mFkkU\"",
		"mtime": "2026-10-06T19:41:42.526Z",
		"size": 684,
		"path": "../public/assets/StatCard-CIEsHFPB.js"
	},
	"/assets/sprix-Bw6tPR-5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c9d-yNmR1+K4xQkM6qiMw13M5ZmDCOM\"",
		"mtime": "2026-10-06T19:41:42.585Z",
		"size": 7325,
		"path": "../public/assets/sprix-Bw6tPR-5.js"
	},
	"/assets/tabs-CBfmksGQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1db9-lTmPbJdG0aYyoVuv/K7WqiZdjx0\"",
		"mtime": "2026-10-06T19:41:42.586Z",
		"size": 7609,
		"path": "../public/assets/tabs-CBfmksGQ.js"
	},
	"/assets/switch-uT03CDBx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"111e-wISmSZzZVnyY/YYAFxrT0Y45erg\"",
		"mtime": "2026-10-06T19:41:42.585Z",
		"size": 4382,
		"path": "../public/assets/switch-uT03CDBx.js"
	},
	"/assets/textarea-DIOv5ElE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"21f-Wl+JvsAB9vCohcD+8ekfCrFdTKc\"",
		"mtime": "2026-10-06T19:41:42.588Z",
		"size": 543,
		"path": "../public/assets/textarea-DIOv5ElE.js"
	},
	"/assets/styles-CY3jlQ2e.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1b032-P/JoDY7g/1kyOKVVUYSmZsp/g4U\"",
		"mtime": "2026-10-06T19:41:42.596Z",
		"size": 110642,
		"path": "../public/assets/styles-CY3jlQ2e.css"
	},
	"/assets/tools-RpxRI5hh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2128-SdW85TX2BKW5e0W7NJ2/PDm34/g\"",
		"mtime": "2026-10-06T19:41:42.588Z",
		"size": 8488,
		"path": "../public/assets/tools-RpxRI5hh.js"
	},
	"/assets/tools.financial-literacy-7M65eJhA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c97-q8pxEalucpt1esB4Wuc61lenyhY\"",
		"mtime": "2026-10-06T19:41:42.589Z",
		"size": 7319,
		"path": "../public/assets/tools.financial-literacy-7M65eJhA.js"
	},
	"/assets/useMutation-BOTi8z4j.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"927-ZxJki7pIdqeE95+SaL3kqTxUrUY\"",
		"mtime": "2026-10-06T19:41:42.590Z",
		"size": 2343,
		"path": "../public/assets/useMutation-BOTi8z4j.js"
	},
	"/assets/wallet-BMev7pDJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11e-MjpuEljS85uKV4KhGTXPtFYBt+s\"",
		"mtime": "2026-10-06T19:41:42.593Z",
		"size": 286,
		"path": "../public/assets/wallet-BMev7pDJ.js"
	},
	"/assets/wallet-BEss_B3H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"194d-QYvt85SpW+xh9fZBH0o2H9x+rQc\"",
		"mtime": "2026-10-06T19:41:42.592Z",
		"size": 6477,
		"path": "../public/assets/wallet-BEss_B3H.js"
	},
	"/assets/uuid-WGNYGote.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216-6NiuN47axqqePtsgovCeZMtC56A\"",
		"mtime": "2026-10-06T19:41:42.592Z",
		"size": 534,
		"path": "../public/assets/uuid-WGNYGote.js"
	},
	"/assets/users-BwZkkB-R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"132-/qxTNuzoVz7CzX59XMdhKdTAMeE\"",
		"mtime": "2026-10-06T19:41:42.591Z",
		"size": 306,
		"path": "../public/assets/users-BwZkkB-R.js"
	},
	"/assets/work-with-wiso-2k05UFdo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b5b-m/TiBu2Zvj6s0vHjGic1Gi0cfX0\"",
		"mtime": "2026-10-06T19:41:42.594Z",
		"size": 2907,
		"path": "../public/assets/work-with-wiso-2k05UFdo.js"
	},
	"/assets/x-BWLTzwqD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-KHTla758hqRB3D9O7PDLQ5Nomk0\"",
		"mtime": "2026-10-06T19:41:42.595Z",
		"size": 154,
		"path": "../public/assets/x-BWLTzwqD.js"
	},
	"/assets/wiso-tools.functions-CuVVSF7o.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b9-JlcC05vD7RMsPQTUXGMSYsJwiOo\"",
		"mtime": "2026-10-06T19:41:42.594Z",
		"size": 1977,
		"path": "../public/assets/wiso-tools.functions-CuVVSF7o.js"
	},
	"/fonts/Cairo-Variable.ttf": {
		"type": "font/ttf",
		"etag": "\"925fc-xsYPZmcAwXvTiDNIO1sU56Lr8Ck\"",
		"mtime": "2026-09-20T10:33:52.967Z",
		"size": 599548,
		"path": "../public/fonts/Cairo-Variable.ttf"
	},
	"/assets/wiso-laptop-w1YvRMqW.png": {
		"type": "image/png",
		"etag": "\"16734e-th6gj8zmTT2wSVWwLEGAyS/EA6U\"",
		"mtime": "2026-10-06T19:41:42.597Z",
		"size": 1471310,
		"path": "../public/assets/wiso-laptop-w1YvRMqW.png"
	},
	"/assets/wiso-mark-BnHwMsb7.png": {
		"type": "image/png",
		"etag": "\"12e40e-f8G8r/VbcaHqtuSYC0iEHHD9sSE\"",
		"mtime": "2026-10-06T19:41:42.598Z",
		"size": 1238030,
		"path": "../public/assets/wiso-mark-BnHwMsb7.png"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_fQjPau = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_fQjPau
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
