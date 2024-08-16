const socket=io()
const chess=new Chess()
// socket.emit("rohan")
// socket.on("Rohan pawar",function()
// {
//     console.log("Rohan Pawar Received")
// })
const boardElement=document.querySelector('.chessboard')
let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;

const renderBoard=()=>{
    const board=chess.board()
    boardElement.innerHTML=""
    //dynamic chess board rendering
    board.forEach((row,rowIndex)=>{
        row.forEach((square,squareindex)=>{
            //create chess board pattern
            const squareElement=document.createElement("div")
            squareElement.classList.add("square",
                (rowIndex+squareindex)%2===0?"light":"dark"     //alternate square block color
            );

            squareElement.dataset.row=rowIndex
            squareElement.dataset.col=squareindex
            
            if(square)
            {
                const pieceElement= document.createElement("div")
                pieceElement.classList.add("piece",
                    square.color==="w"?"white":"black" //to give white and black color gotya
                )
                pieceElement.innerText=getPieceUnicode(square)//piece Element are signs king ,horse
                pieceElement.draggable=playerRole===square.color; //player role and color same then square if draggble 
                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable)
                    {
                        draggedPiece=pieceElement
                        sourceSquare={row:rowIndex,col:squareindex}
                        e.dataTransfer.setData("text/plain","")
                    }
                })
                //squareElement is pattern square block and     
                pieceElement.addEventListener("dragend",()=>{
                    draggedPiece=null
                    sourceSquare=null
                })

                squareElement.appendChild(pieceElement)
            }
            
            squareElement.addEventListener("dragover",(e)=>{
                e.preventDefault()
            })

            squareElement.addEventListener("drop",(e)=>{
                e.preventDefault()
                if(draggedPiece)
                {
                   const targetSource={
                    row:parseInt(squareElement.dataset.row),
                    col:parseInt(squareElement.dataset.col)
                   }
                handleMove(sourceSquare,targetSource)
                }
            })
        
        boardElement.appendChild(squareElement)
    })
    })
    if(playerRole==="b")
    {
        boardElement.classList.add("flipped")
    }
    else{
        boardElement.classList.remove('flipped')
    }
}

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q' // Adjust based on promotion logic if necessary
    };
    console.log('Emitting move:', move); // Debugging
    socket.emit('move', move);
};


const getPieceUnicode=(piece)=>{
    const unicodePieces = {
        K: '♔', // White King
        Q: '♕', // White Queen
        R: '♖', // White Rook
        B: '♗', // White Bishop
        N: '♘', // White Knight
        P: '♙', // White Pawn
        k: '♚', // Black King
        q: '♛', // Black Queen
        r: '♜', // Black Rook
        b: '♝', // Black Bishop
        n: '♞', // Black Knight
        p: '♟', // Black Pawn
    };
    return unicodePieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()] || ""; // Ensure correct mapping for pawns and other pieces
};

socket.on("playerRole",function(role){
    playerRole=role;
    renderBoard()
})

socket.on("Spectetor",function(){
    playerRole=null;
    renderBoard()
})

socket.on("boardState",function(fen){
    chess.load(fen); 
    renderBoard();
    updateTurnIndicator()
    
})

socket.on("move",function(move){
    chess.move(move);
    renderBoard();
    updateTurnIndicator()
    
})
const updateTurnIndicator = () => {
    turnIndicator.textContent = chess.turn() === 'w' ? "White's Turn(player 1)" : "Black's Turn(player 2)";
};

renderBoard()