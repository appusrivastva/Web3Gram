import React from "react";
import Post from "./Post";

export default function PostList({ posts, postOwner, onDelete }) {
  if (!posts || posts.length === 0) {
    return (
      <p className="text-gray-500 italic text-center mt-10 text-lg">
        No posts found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 py-6">
      {posts.map((post) => (
        <Post
          key={post.postId.toString()}
          post={post}
          postOwner={postOwner}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
