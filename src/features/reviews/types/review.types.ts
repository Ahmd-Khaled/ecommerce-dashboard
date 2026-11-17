export type ReviewState = "pending" | "published" | "hidden" | "removed";
export type ReviewUser = { firstName?: string; lastName?: string; email?: string; avatar?: string };
export type ReviewProduct = { name?: string; slug?: string; isActive?: boolean };
export type ModerationEvent = { actorId: string; actorRole: string; from: ReviewState; to: ReviewState; at: string; reason?: string };
export type Review = { id: string; productId: string; rating: number; text?: string; state: ReviewState; createdAt: string; updatedAt?: string; user?: ReviewUser | null; product?: ReviewProduct | null; moderationHistory?: ModerationEvent[] };
export type ReviewList = { reviews: Review[]; nextCursor: string | null };
export type ReviewFilters = { limit: number; after?: string; productId?: string; state?: ReviewState; queue?: "new" };
export type ReviewSettings = { autoApproveReviews: boolean };
