import { Review } from "../Review";

export const addReview = ({ accountId, userId }) => ({
  accountId,
  userId,
  async add({ partnerId, scoring }) {
    const review = await Review.create_async({
      reviewerId: accountId,
      subjectId: partnerId,
      score: scoring
    });
    return review._id;
  }
});
