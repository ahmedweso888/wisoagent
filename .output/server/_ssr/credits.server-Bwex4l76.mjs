import { t as getUserSupabase } from "./user-client.server-Bhj7_9Zh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/credits.server-Bwex4l76.js
/**
* WISO Credit / Quota Reservation.
*
* Uses atomic database-side RPCs (reserve_ai_credits / commit_ai_credits /
* release_ai_credits) to ensure race-safe quota management.
*
* Flow:
*   authenticate → verify entitlement → check quota → atomically reserve
*   → generation → validation → commit actual usage OR release reservation
*
* Prevents: negative balances, double charging, concurrent race conditions,
* duplicate reservations, charging failed requests, cross-student charging.
*/
/**
* Atomically reserves credits for a pending AI operation.
* Throws on quota exceeded, no subscription, or authentication failure.
*/
async function reserveCredits(userId, requestId, resourceType, amount) {
	const { data, error } = await getUserSupabase().rpc("reserve_ai_credits", {
		_request_id: requestId,
		_resource_type: resourceType,
		_amount: amount
	});
	if (error) {
		if (error.message.startsWith("quota_exceeded")) throw new QuotaExceededError(error.message);
		if (error.message.includes("no active subscription")) throw new NoEntitlementError(error.message);
		throw new Error(`credit_reservation_failed: ${error.message}`);
	}
	return {
		id: data,
		requestId,
		resourceType,
		amount
	};
}
/** Commits a reservation — the AI call succeeded, usage is final. */
async function commitCredits(reservationId, actualAmount) {
	const { error } = await getUserSupabase().rpc("commit_ai_credits", {
		_reservation_id: reservationId,
		...actualAmount === void 0 ? {} : { _actual_amount: actualAmount }
	});
	if (error) throw new Error(`credit_commit_failed: ${error.message}`);
}
/** Releases a reservation — the AI call failed, quota returned. */
async function releaseCredits(reservationId) {
	const { error } = await getUserSupabase().rpc("release_ai_credits", { _reservation_id: reservationId });
	if (error) console.error(`[wiso] credit release failed for ${reservationId}:`, error.message);
}
/**
* Safely runs an AI operation with credit reservation.
* Automatically commits on success or releases on failure.
*/
async function withCredits(userId, requestId, resourceType, amount, operation) {
	const reservation = await reserveCredits(userId, requestId, resourceType, amount);
	try {
		const result = await operation();
		await commitCredits(reservation.id);
		return result;
	} catch (error) {
		await releaseCredits(reservation.id);
		throw error;
	}
}
var QuotaExceededError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "QuotaExceededError";
	}
};
var NoEntitlementError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "NoEntitlementError";
	}
};
//#endregion
export { withCredits as i, releaseCredits as n, reserveCredits as r, commitCredits as t };
