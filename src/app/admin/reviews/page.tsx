
import { getOrders, getUsers } from "@/lib/firebase-actions";
import { ReviewsClientPage } from "./reviews-client-page";

export default async function AdminReviewsPage() {
  const [orders, users] = await Promise.all([getOrders(), getUsers(true)]);

  const reviewedOrders = orders
    .filter((order): order is Order & { rating: number; review: string } => 
      typeof order.rating === 'number' && typeof order.review === 'string'
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">مراجعات العملاء</h1>
      </div>
      <ReviewsClientPage reviewedOrders={reviewedOrders} users={users} />
    </main>
  );
}
