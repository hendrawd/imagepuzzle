$(document).ready(function() {
	
	var url = window.location.href,
		idCounter,
		score,
		target,
		sound = "on",
		noOfMoves = 0,
		image = decodeURIComponent((url.split('&')[0]).split('=')[1]),
		rowCount = (url.split('&')[1]).split('=')[1],
		timerIntervalId = 0,
		move_snd = new Audio("sounds/move1.wav"),
		shuffle_snd = new Audio("sounds/shuffle1.wav"),
		win_snd  = new Audio("sounds/success1.wav");
	
	PicPuzzle_Utils.checkCookie();
	PicPuzzle_Utils.initButtons();

	//validate row input
	if(rowCount > 9){
		
		rowCount = 9;
		PicPuzzle_Utils.updateText('message','9x9 is the maximum grid size.');
		PicPuzzle_Utils.notify('#message',5000);

	} else if (rowCount < 2){
		
		rowCount = 2;
		PicPuzzle_Utils.updateText('message','2x2 is the minimum grid size.');
		PicPuzzle_Utils.notify('#message',5000);
	}
	
	newGame(image,rowCount);
	jumblePuzzle(rowCount);
	
	
	//check for sound toggle
    $('#soundClick').on('click', function(e) {
		if(sound == "on"){
        	sound = "off";
        	$(this).button('option', 'label', 'Unmute');
		}
        else{
        	sound = "on";
        	$(this).button('option', 'label', 'Mute');
		}
     });



	function newGame(image,rowCount){

		var blankRow = 0,
			blankCol = 0;

		PicPuzzle_ImageActions.split(image, rowCount * rowCount, function(canvasArray) {	    
		
			//list to keep track of the tiles which are available for random selection 
			var tilesAvailable = new Array(rowCount^2);
	
			//tilesAvailable contains possible tile numbers to select from at random
			//array is full as no values have been randomly selected yet
			for (var i = 0; i <canvasArray.length; i++) {
				tilesAvailable[i] = i ;
			}

			var $tbl = $('<table border="1">').attr('id', 'grid'),
				$tbody = $('<tbody>').attr('id', 'tableBody'),
				index = 0;
			
			
			for (var i = 0; i < rowCount; i++) {

				var trow = $("<tr>").attr('id', 'row' + i); // New row
				
				for (var j = 0; j < rowCount; j++) {
				
				        var $cell = $("<td>").append(canvasArray[index]);
					$cell.attr('id','cell'+index);

				 	//Get the row and column position of the last canvas element
				    if(index == ((canvasArray.length -1))){
					                   
						blankRow = i,
							blankCol = j;
					}                 

					$cell.appendTo(trow); 
					index++;
				}

				trow.appendTo($tbody);
				$tbl.append($tbody);
				$('table').remove();	
				$('#content').append($tbl);
			}
		});
		
		//Position the blank cell in the position of the last canvas element
		$('#grid tr:eq('+blankRow+') td:eq('+blankCol+')').children().hide();
		$('#grid tr:eq('+blankRow+') td:eq('+blankCol+')').attr('id', 'blankCell');
		
		//reset number of moves when image is scrambled
		noOfMoves = 0;
		PicPuzzle_Utils.updateText('moveCount',noOfMoves);
		
		//play start sound
		if (sound == "on"){
			shuffle_snd.play();
		}
		
		PicPuzzle_Utils.setStartTime(new Date());
		
		//ensuring timerIntervalId is cleared
		if (timerIntervalId){
			clearInterval(timerIntervalId);
		}
		
		timerIntervalId = setInterval(PicPuzzle_Utils.initTimer, 100);

		return false;
	};

	//Description: Jumbles the puzzle to a random but solvable state
	//Paramaters: rowCount: The number or rows which is equal to the number
	//	      of columns
	function jumblePuzzle(rowCount){
        	   
          var prevDir = null;
	  for (var i =0; i< rowCount*rowCount *2; i++){
	  
	      //get the blank cell
	      var empty = $("#blankCell").get(0),
		  emptyrow = empty.parentNode,
		  ex = empty.cellIndex,
		  ey = emptyrow.rowIndex;

	      //get possible directions
	      var dirs = getPossibleDirections(ex,ey,rowCount);
	      
	      
	      //check to make sure randDir is not the opposite of prevDir
	       //we do not want to undo the previous move
	      if (prevDir != null){
		  
		//remove the opposite direction from the possible choices
		  if (prevDir == 'u')
		       dirs = PicPuzzle_Utils.removeItemFromList(dirs,'d');
		  else if (prevDir == 'd')
		       dirs = PicPuzzle_Utils.removeItemFromList(dirs,'u');
		  else if (prevDir == 'r')
		       dirs = PicPuzzle_Utils.removeItemFromList(dirs,'l');
		  else
		       dirs = PicPuzzle_Utils.removeItemFromList(dirs,'r');
	      }
	      
	      //choose a dir at random
	      var randDir = PicPuzzle_Utils.randomChoice(dirs);
	      prevDir = randDir; 
	      //move the empty cell in the direction
	      moveEmptyCell(ex,ey,randDir);
	  }

	}


	//Description: Get the possible directions that the empty cell can move in
	//Paramaters: empty cell position, 
	//	      empty row position, 
	//	      the number of rows
	//
	//Returns:    The possible directions to the empty cell can move
	//            ['l','r','u','d'] left,right,up,down
	function getPossibleDirections(ex,ey,rowCount){
	
	    var max = rowCount -1,
	    	min =0; 
	    //calculate the possible directions to choose
	    //the random cell

	    //we can go right or down
	    //top left corner
	    if(ex == min && ey == min){
	        console.log("top left corner"); 
		var dirs = ['r','d'];
		return dirs;
	    }
	    //we can go right or up
	    //bottom left corner
	    else if(ex == min && ey == max){
	    
		console.log("bottom left corner");
		var dirs = ['r','u'];
		return dirs;
	    }
	    //we can go left or down
	    //top right corner
	    else if(ex == max && ey == min){
	   
		console.log("top right corner"); 
		var dirs = ['l','d'];
		return dirs;
	    }
	    //we can go left or up
	    //bottom right corner
	    else if(ex == max && ey == max){
	    
		console.log("bottom right corner"); 
		var dirs = ['l','u'];
		return dirs;
	    }
	    //we can go right, up or down
	    //left side
	    else if(ex == min && (ey > min  && ey < max)){
	    
	        console.log("left edge"); 
		var dirs = ['r','u','d'];
		return dirs;
	    }
	    //we can go left, up or down
	    //right side
	    else if(ex == max && (ey > min  && ey < max)){
	    
		console.log("right edge"); 
		var dirs = ['l','u','d'];
		return dirs;
	    }
	    //we can go left, right or up
	    //bottom side
	    else if(ey == max && (ex > min  && ex < max)){
	    
		console.log("bottom edge"); 
		var dirs = ['l','r','u'];
		return dirs;
	    }
	    //we can go left, right or down
	    //top side
	    else if(ey == min && (ex > min  && ex < max)){
	    
		console.log("top edge"); 
		var dirs = ['l','r','d'];
		return dirs;
	    }
	    //we can choose a cell in any direction
	    //cell is not touching a puzzle edge
	    else{
		console.log("any");
		var dirs = ['l','r','u','d'];
		return dirs;

	    }
	}
	//Description: Moves the empty cell with a cell in a specified direction
	//Paramaters:  empty cellIndex, empty rowIndex, direction to move
	function moveEmptyCell(ex,ey,direction){
	    var cellid ="";	  
            
	    //up
	    if(direction == 'u'){
	    
		cellid =document.getElementById("row"+(ey-1)).childNodes[ex].id;
		console.log(cellid);
	    }
	    //down
	    else if (direction == 'd'){
	    
		cellid  =document.getElementById("row"+(ey+1)).childNodes[ex].id;
		console.log(cellid);
	    }
	    //left
	    else if (direction == 'l'){
	    
		cellid =document.getElementById("row"+ey).childNodes[ex-1].id;
		console.log(cellid);
	    }
	    //right
	    else{
	    
		cellid =document.getElementById("row"+ey).childNodes[ex+1].id;
		console.log(cellid);
	    }
	    
	    //swap cells
	    var cell = $("#"+cellid).get(0),
	        currow = cell.parentNode,
		empty = $("#blankCell").get(0),
	        emptyrow = empty.parentNode,
	        afterempty = empty.nextSibling,
	        afterthis = cell.nextSibling;
	        currow.insertBefore(empty, afterthis); 
	        emptyrow.insertBefore(cell, afterempty);
	  
	}


	// Event handler for clicking table cells
	$('#content').on('click', '#grid td', function(e) {
		
		idCounter = 0,
			score = 0;

		console.log('onclick: ' +this);
		
		var empty = $("#blankCell").get(0);
		if (!empty || this == empty) return; // abort, abort!

	    var currow = this.parentNode,
	        emptyrow = empty.parentNode;
	    var cx = this.cellIndex,
	        cy = currow.rowIndex,
	        ex = empty.cellIndex,
	        ey = emptyrow.rowIndex;
	    if (cx==ex && Math.abs(cy-ey)==1 || cy==ey && Math.abs(cx-ex)==1) {
	        // empty and this are next to each other in the grid
	        var afterempty = empty.nextSibling,
	            afterthis = this.nextSibling;
	        currow.insertBefore(empty, afterthis); 
	        emptyrow.insertBefore(this, afterempty);
			
			noOfMoves++;

			//play the move sound
			if(sound == "on"){
				move_snd.play();
			}

			PicPuzzle_Utils.updateText('moveCount',noOfMoves);
	    }
	    
	    // Check if puzzle is complete after each move
	    $("td").each(function() {
	    	target = rowCount * rowCount;
	    	
	    	if ($(this).children().attr("id") == "canvas" + idCounter){
	    		score++;
	    		if (score == target){
	    			
	    			//show complete image
					$("#blankCell").children().show();
					$("#blankCell").attr('id', $("#blankCell").children().attr('id'));
					
					if(sound == "on"){
						win_snd.play();
					}
					
					// stop timer in UI
					clearInterval(timerIntervalId);	
					
					var endTime = new Date(),
						duration = PicPuzzle_Utils.diffBetweenTimes(
		            		PicPuzzle_Utils.getStartTime(), 
		            		endTime); 
					PicPuzzle_Utils.updateText('timer', duration);
					
					PicPuzzle_Utils.increasePuzzlesSolved();
					PicPuzzle_Utils.updateText('puzzlesSolved', PicPuzzle_Utils.getCookie("puzzlesSolved"));

					PicPuzzle_Utils.playAgain(
							"Congratulations!<br/>" +
							"You solved the puzzle in<br/>" +
					        + noOfMoves + " move(s)<br/>" +
				            "Duration: " + duration +
							"<br/><br/>Would you like to play again?");
	    		}
	    	}
	    	
	    	idCounter++;
		});
	});
});
