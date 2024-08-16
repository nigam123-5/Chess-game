const express=require('express')
const {Chess}=require('chess.js')
const socket=require('socket.io')
const http=require('http')
const path=require('path')
const { title } = require('process')

const app=express();
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')))

//create server using http and  express app
const server=http.createServer(app)

const io=socket(server)

const chess=new Chess()
let players={};
let cureentPlayer="w"

app.get("/",(req,res)=>{
    res.render("index",{title:"Chess Game"})
})
//connection means user connected
io.on("connection",function(uniquesocket){
    console.log("User connected")
    // uniquesocket.on("rohan",function(){
    //     io.emit("Rohan pawar")
    // })

    //if no user present then first is white
    if(!players.white)
    {
        players.white=uniquesocket.id
        uniquesocket.emit("playerRole","w")
    }//if white present then 2nd black
    else if(!players.black){
        players.black=uniquesocket.id
        uniquesocket.emit("playerRole","b")
    }//if both present other is viewwer
    else{
        uniquesocket.emit("Spectetor")
    }
    //if player leave game
    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id===players.white)
        {
            delete players.white
        }
        else if(uniquesocket.id===players.black)
        {
            delete players.black
        }
    })

    uniquesocket.on("move",(move)=>{
        try{
            //if turn is of white and other than w  play then return same for black
            if(chess.turn()==="w" && uniquesocket.id!==players.white) return;
            if(chess.turn()==='b' && uniquesocket.id!==players.black)return;

            //check is move valid
            const result=chess.move(move)
            if(result)
            {
                cureentPlayer=chess.turn()
                io.emit("move",move);
                io.emit("boardState",chess.fen())//to send board state to all(sabko pata chaelga)
            }
            else{
                console.log("Invalig move :",move)
                uniquesocket.emit("Invalid move ",move)//send to only connected user (sirf connected)
            }
        }
        catch(err){
            console.log(err)
            uniquesocket.emit("Invalid Move",move)
        }
    })
})

server.listen(3000,()=>{
    console.log("Server Listen On 3000")
})