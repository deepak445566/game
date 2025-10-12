import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"user"
},
body:{
type:String,
required:true
},
likes:{
type:Number,
default:0
},
 likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: []
  }],
createdAt:{
type:Date,
default:Date.now
},
updatedAt:{
type:Date,
default:Date.now
},
media:{
type:String,
default:''
},
active:{
  type:Boolean,
  default:true

},
fileType:{
  type:String,
  default:''

}


});

const Post =mongoose.model('post', PostSchema);
export default Post;