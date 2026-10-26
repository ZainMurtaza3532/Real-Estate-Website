"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { submitAgentReview } from "@/actions/agent-reviews";
import { toast } from "sonner";
import { Star, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

interface AgentReviewFormProps {
  agentId: string;
  agentName: string;
}

export function AgentReviewForm({ agentId, agentName }: AgentReviewFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.info("Please sign in to leave a verified client review.");
      router.push(`/login?callbackUrl=/agents/${agentId}`);
      return;
    }

    if (!comment.trim()) {
      toast.error("Please provide a brief feedback comment.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitAgentReview({
        agentId,
        rating,
        comment,
      });

      if (res.success) {
        toast.success("Thank you! Your verified client review has been published.");
        setHasSubmitted(true);
        setComment("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to submit review.");
      }
    } catch {
      toast.error("Error submitting review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
        <CheckCircle2 className="size-8 mx-auto text-emerald-600" />
        <h4 className="font-heading font-bold text-base text-emerald-950 dark:text-emerald-200">
          Review Submitted
        </h4>
        <p className="text-xs text-emerald-800 dark:text-emerald-400">
          Your feedback helps buyers and sellers connect with top verified advisors.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4"
    >
      <div className="space-y-1">
        <h4 className="font-heading font-bold text-base text-zinc-950 dark:text-white">
          Review {agentName}
        </h4>
        <p className="text-xs text-zinc-500">
          Share your experience with showings, negotiations, and advisory responsiveness.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Rating
        </label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`size-6 ${
                  (hoverRating || rating) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300 dark:text-zinc-700"
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 ml-2 font-mono">
            {rating} of 5 Stars
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Testimonial & Feedback
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe your tour experience, communication, and market knowledge..."
          required
          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Star className="size-3.5 fill-amber-500 text-amber-500" />
        )}
        <span>{isSubmitting ? "Submitting Review..." : "Post Verified Review"}</span>
      </button>
    </form>
  );
}
