'use client';

export default function CommentItem({ comment, setReplyTo }) {
  return (
    <div className="border-2 border-[#e60000] bg-white rounded-xl shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-[#e60000]">{comment.author || 'אנונימי'}</p>
        <p className="text-xs text-gray-600">
          {new Date(comment.date).toLocaleString('he-IL')}
        </p>
      </div>

      {comment.reply_to && (
        <p className="text-xs text-gray-600 mb-1">
          בתגובה להודעה #{comment.reply_to}
        </p>
      )}

      <p className="whitespace-pre-line leading-relaxed text-black mb-3">
        {comment.text}
      </p>

      <button
        onClick={() => setReplyTo(comment.id)}
        className="text-sm text-[#e60000] hover:underline"
      >
        השב
      </button>
    </div>
  );
}
