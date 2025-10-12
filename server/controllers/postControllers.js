import Post from "../models/postModel.js";

import { v4 as uuidv4 } from "uuid";
import { uploadFile } from "../config/cloudconfig.js";
import Comment from "../models/commentModel.js";


 export const activeCheck = async(req,res)=>{
  return res.status(200).json({
    message:"RUNNING"
  })
}




export const createPost = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    let mediaUrl = "";
    let fileType = "";

    if (req.file) {
      const fileUpload = await uploadFile(req.file.buffer, uuidv4()); 
      mediaUrl = fileUpload.url;                     // ✅ URL from ImageKit
      fileType = req.file.mimetype.split("/")[0];    // "image" / "video"
    }

    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: mediaUrl,
      fileType: fileType
    });

    await post.save();

    return res.status(200).json({ message: "Post Created", post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const getAllPosts = async (req, res) => {
  try {
    // ✅ database se saare posts fetch karo
    const posts = await Post.find()
      .populate("userId", "name username email profilePicture") // optional: user ke details bhi laa sakte ho
      .sort({ createdAt: -1 }); // latest post pehle

    // ✅ agar posts nahi mile
    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No posts found",
      });
    }

    // ✅ response bhejo
    res.status(200).json({
      success: true,
 
      posts,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching posts",
    });
  }
};

// controllers/postController.js

// Get posts of logged-in user only
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ Get logged-in user's ID
    
    // ✅ Fetch only posts of the logged-in user
    const posts = await Post.find({ userId: userId })
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You haven't created any posts yet",
      });
    }

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching your posts",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const user = req.user;

    // ✅ Check if user is authenticated
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    // ✅ Find the post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // ✅ Check if the user owns the post
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete your own posts",
      });
    }

    // ✅ Delete the post
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting post:", error);
    
    // Handle CastError (invalid postId format)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while deleting post",
    });
  }
};




export const createComment = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const { postId } = req.body;

    const { body } = req.body;

    // ✅ Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // ✅ Create new comment
    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      body,
    });

    await comment.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating comment",
    });
  }
};



export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.query;

    const comments = await Comment.find({ postId })
      .populate("userId", "name username profilePicture")
      .sort({ _id: 1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching comments",
    });
  }
};







export const deleteComment = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const { commentId } = req.body; // ✅ Directly from req.body

    // ✅ Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // ✅ Check if user owns the comment
    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete your own comments",
      });
    }

    // ✅ Delete comment
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting comment:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while deleting comment",
    });
  }
};


export const likePost = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { postId } = req.body;

    let post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    console.log("🔄 LIKE PROCESS STARTED");
    console.log("Current post:", {
      id: post._id,
      currentLikes: post.likes,
      likedBy: post.likedBy || []
    });

    // ✅ Ensure likedBy array exists
    if (!post.likedBy) {
      post.likedBy = [];
    }

    // ✅ Check if user already liked this post
    const userAlreadyLiked = post.likedBy.some(
      likedUserId => likedUserId.toString() === user._id.toString()
    );

    console.log("User already liked:", userAlreadyLiked);

    let newLikes;
    let likedStatus;

    if (userAlreadyLiked) {
      // ✅ UNLIKE - Remove user from likedBy
      post.likedBy = post.likedBy.filter(
        likedUserId => likedUserId.toString() !== user._id.toString()
      );
      newLikes = Math.max(0, (post.likes || 0) - 1); // ✅ Never go below 0
      likedStatus = false;
      
      console.log("🔻 UNLIKING - New likes:", newLikes);
    } else {
      // ✅ LIKE - Add user to likedBy
      post.likedBy.push(user._id);
      newLikes = (post.likes || 0) + 1;
      likedStatus = true;
      
      console.log("🔺 LIKING - New likes:", newLikes);
    }

    // ✅ Update the post
    post.likes = newLikes;
    await post.save();

    console.log("✅ FINAL RESULT:", {
      likes: newLikes,
      liked: likedStatus,
      likedByCount: post.likedBy.length
    });

    return res.status(200).json({
      success: true,
      likes: newLikes,
      liked: likedStatus, // ✅ This will be proper true/false
      message: likedStatus ? "Post liked" : "Post unliked"
    });

  } catch (error) {
    console.error("❌ Error in likePost:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


