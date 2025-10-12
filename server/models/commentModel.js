import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
userId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"user"
},
postId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  
},
body:{
  type:String,
  required:true
}



});


const Comment =mongoose.model('comment', CommentSchema);
export default Comment;
