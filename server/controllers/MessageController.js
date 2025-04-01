import getPrismaInstance from "../utils/PrismaClient.js"
import {renameSync} from 'fs'

export const addMessage= async(req,res,next)=>{
    try{
        const prisma=getPrismaInstance();
        const {message,from,to} =req.body;
        const getUser= onlineUsers.get(to);
        if(message && from && to){
            const newMessage=await prisma.messages.create({
                data:{
                    message,
                    sender:{connect: { id: parseInt(from) }},
                    receiver: {connect: {id: parseInt(to) }},
                    messageStatus: getUser?"delivered":"sent",
                },
                include:{
                    sender:true,
                    receiver:true,
                },
            });
            return res.status(201).send({message:newMessage});
        }
        return res.status(400).send("From,to and Message is Required");
    }
    catch(err){
        next(err)
    }
}

export const getMessages=async(req,res,next)=>{
    try{
        const prisma=getPrismaInstance();
        const {from,to} = req.params;
        const messages = await prisma.messages.findMany({
            where:{
                OR:[
                    {
                        senderId:parseInt(from),
                        receiverId:parseInt(to),
                    },
                    {
                        senderId:parseInt(to),
                        receiverId:parseInt(from),
                    },
                ],
            },
            orderBy:{
                id:"asc",
            },
        });
        const unreadMessages=[];
        messages.forEach((message,index)=>{
            if(message.messageStatus!=="read" && message.senderId===parseInt(to)){
                messages[index].messageStatus="read";
                unreadMessages.push(message.id);
            }
        });
        await prisma.messages.updateMany({
            where:{
                id:{in:unreadMessages},
            },
            data:{
                messageStatus:"read",
            },
        });

        res.status(200).json({messages});
    }
    catch(err){
        next(err)
    }
}

// export const getMessages = async (req, res, next) => {
//     try {
//         const prisma = getPrismaInstance();
//         const { from, to } = req.params; // Extract sender and receiver IDs from request parameters
//         const fromId = parseInt(from); // Parse sender ID as integer
//         const toId = parseInt(to); // Parse receiver ID as integer

//         if (isNaN(fromId) || isNaN(toId)) {
//             return res.status(400).send("Invalid sender or receiver ID.");
//         }

//         // Retrieve messages exchanged between the sender and receiver
//         const messages = await prisma.messages.findMany({
//             where: {
//                 OR: [
//                     { senderId: fromId, receiverId: toId },
//                     { senderId: toId, receiverId: fromId },
//                 ],
//             },
//             orderBy: { id: "asc" }, // Sort messages by ascending ID
//         });

//         const unreadMessages = []; // Array to store IDs of unread messages

//         // Update message status to "read" if the recipient (toId) retrieves the messages
//         messages.forEach((message, index) => {
//             if (message.messageStatus !== "read" && message.receiverId === toId) {
//                 messages[index].messageStatus = "read"; // Update status locally
//                 unreadMessages.push(message.id); // Add message ID to the list of unread messages
//             }
//         });

//         // Update the message status in the database if there are unread messages
//         if (unreadMessages.length > 0) {
//             await prisma.messages.updateMany({
//                 where: { id: { in: unreadMessages } },
//                 data: { messageStatus: "read" },
//             });
//         }

//         // Respond with the list of messages
//         res.status(200).json({ messages });
//     } catch (err) {
//         next(err); // Pass any errors to the error-handling middleware
//     }
// };

//fs.renameSync(oldPath, newPath) - changing the filename or directory

export const addImageMessage=async(req,res,next)=>{
    try{
        if(req.file){
            const data=Date.now();
            let fileName="uploads/images/"+data+req.file.originalname;
            renameSync(req.file.path, fileName);
            const prisma= getPrismaInstance();
            const {from,to}=req.query;
            if(from && to){
                const message=await prisma.messages.create({
                    data:{
                        message: fileName,
                        sender:{connect: { id: parseInt(from) }},
                        receiver: {connect: {id: parseInt(to) }},
                        type:"image"
                    }
                })
                return res.status(201).json({message});
            }
            return res.status(400).send("From,To is required");
        }
        return res.status(400).send("Image is required");
    }
    catch(err){
        next(err)
    }
}


export const addAudioMessage=async(req,res,next)=>{
    try{
        if(req.file){
            const data=Date.now();
            let fileName="uploads/recordings/"+data+req.file.originalname;
            renameSync(req.file.path, fileName);
            const prisma= getPrismaInstance();
            const {from,to}=req.query;
            if(from && to){
                const message=await prisma.messages.create({
                    data:{
                        message: fileName,
                        sender:{connect: { id: parseInt(from) }},
                        receiver: {connect: {id: parseInt(to) }},
                        type:"audio"
                    }
                })
                return res.status(201).json({message});
            }
            return res.status(400).send("From,To is required");
        }
        return res.status(400).send("Audio is required");
    }
    catch(err){
        next(err)
    }
}

export const getInitialContactswithMessages=async(req,res,next)=>{
    try{
        const userId=parseInt(req.params.from);
        const prisma=getPrismaInstance();
        const user = await prisma.user.findUnique({
            where:{id:userId},
            include:{
                sentMessages:{
                    include:{
                        receiver:true,
                        sender:true,
                    },
                    orderBy:{
                        createdAt:"desc",
                    },
                },
                receivedMessages:{
                    include:{
                        receiver:true,
                        sender:true,
                    },
                    orderBy:{
                        createdAt:"desc",
                    },
                }
            }
        });
        const messages=[...user.sentMessages,...user.receivedMessages];
        messages.sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime());
        const users=new Map();
        const messageStatusChange=[];

        messages.forEach((msg)=>{
            const isSender=msg.senderId===userId ;
            const calculatedId=isSender?msg.receiverId:msg.senderId;
            if(msg.messageStatus==="sent"){
                messageStatusChange.push(msg.id)
            }
            const{
                id,
                type,
                message,
                messageStatus,
                createdAt,
                senderId,
                receiverId,
            }=msg;
            if(!users.get(calculatedId)){
                
                let user={
                    messageId: id,
                    type,
                    message,
                    messageStatus,
                    createdAt,
                    senderId,
                    receiverId,
                };
                if(isSender){
                    user={
                        ...user,
                        ...msg.receiver,
                        totalUnreadMessages:0,
                    }
                }
                else{
                    user={
                        ...user,
                        ...msg.sender,
                        totalUnreadMessages: messageStatus!=="read"?1:0,
                    }
                }
                users.set(calculatedId,{...user});
            }
            else if(messageStatus!=="read" && !isSender){
                const user=users.get(calculatedId);
                users.set(calculatedId,{
                    ...user,
                    totalUnreadMessages: user.totalUnreadMessages+1,
                })
            }
        })
        if(messageStatusChange.length){
            await prisma.messages.updateMany({
                where:{
                    id:{in:messageStatusChange},
                },
                data:{
                    messageStatus:"delivered",
                },
            });
        }
        return res.status(200).json({
            users: Array.from(users.values()),
            onlineUsers: Array.from(onlineUsers.keys()),
        })
    }
    catch(err){
        next(err);
    }
}