import { ReviewForm, ReviewsSection } from '../components/Reviews';

export default function Reviews() {
    return (
        <>
            <ReviewsSection limit={100} title="Student reviews" />
            <div className="mx-auto max-w-2xl px-4 pb-14">
                <ReviewForm />
            </div>
        </>
    );
}