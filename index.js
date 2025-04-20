import example from "./data/dataset.json" with { type: "json" };

/** Loads flashcard progress from local storage if available. */
function loadProgress() {
	const stored = localStorage.getItem("flashcardProgress");
	return stored ? JSON.parse(stored) : {};
}

/** Saves the current progress back to local storage. */
function saveProgress(progress) {
	localStorage.setItem("flashcardProgress", JSON.stringify(progress));
}

// Sorts the flashcards by their due date to prioritise learning.
const progressData = loadProgress();
const cards = example
	.sort((a, b) => {
		// Put cards without a dueDate at the last
		const dateA = progressData[a.id]?.dueDate ? new Date(progressData[a.id].dueDate) : Infinity;
		const dateB = progressData[b.id]?.dueDate ? new Date(progressData[b.id].dueDate) : Infinity;
		return dateA - dateB;
	});

let currentIndex = 0;

const entriesBody = document.getElementById("entries-body");

/** Creates a table row for each card, allowing quick navigation. */
function initEntries() {
	// Build table rows
	cards.forEach((card, i) => {
		const row = document.createElement("tr");
		row.addEventListener("click", () => {
			currentIndex = i;
			renderCard();
		});
		const cellId = document.createElement("td");
		cellId.textContent = card.id;
		const cellWord = document.createElement("td");
		cellWord.textContent = card.word;
		const cellDue = document.createElement("td");
		cellDue.textContent = progressData[card.id]?.dueDate || "Unseen"; // If the card has not been learnt before, mark it as "Unseen"

		row.appendChild(cellId);
		row.appendChild(cellWord);
		row.appendChild(cellDue);
		entriesBody.appendChild(row);
	});
}

/** Updates highlighted row and due dates each time we render or change data. */
function updateEntries() {
	// Update row highlight and due dates
	cards.forEach((card, i) => {
		const row = entriesBody.children[i];
		row.classList.toggle("row-highlight", i === currentIndex);

		const cellDue = row.children[row.childElementCount - 1];
		const dueDateString = progressData[card.id]?.dueDate;
		if (dueDateString) {
			cellDue.textContent = dueDateString;
			// If the due date is earlier than today, mark it as overdue
			const dueDate = new Date(dueDateString);
			const today = new Date();
			cellDue.classList.toggle("overdue-date", dueDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0));
		} else {
			cellDue.textContent = "Unseen";
			cellDue.classList.remove("overdue-date");
		}
	});
}




// Grabs references to the flashcard UI elements needed to display data.
const frontSentence = document.getElementById("front-sentence");
const backSentence = document.getElementById("back-sentence");
const backDefinition = document.getElementById("back-definition");
const frontImage =  document.getElementById("front-image");
const frontImage2 =  document.getElementById("front-image2");
const backImage = document.getElementById("back-image");
const backImage2 = document.getElementById("back-image2");
const backAudio = document.getElementById("back-audio");


const flipCardCheckbox = document.getElementById("flip-card-checkbox");
const cardInner = document.getElementById("card-inner");
const transitionHalfDuration = parseFloat(getComputedStyle(cardInner).transitionDuration) * 1000 / 2;

/** Renders the current card on both front and back. */
function renderCard() {

	// Update the front side with the current card's word
	const currentCard = cards[currentIndex];
	const sentence2WithSpans = currentCard.sentence2.split(' ').map((word, index) => 
        `<span class="word" data-index="${index}">${word}</span>`
    ).join(' ');
	frontSentence.textContent = currentCard.sentence;
	frontImage.src = currentCard.image;
	frontImage2.src = currentCard.image;
	frontImage.style.display = "block";



    const regularBoxBack = document.getElementById("regular-box-back");
    const irregularBoxBack = document.getElementById("irregular-box-back");


	regularBoxBack.classList.remove("active");
	irregularBoxBack.classList.remove("active");
   

	// Reset flashcard to the front side
	flipCardCheckbox.checked = false;

	// Wait for the back side to become invisible before updating the content
	setTimeout(() => {
		
	 
		
		 if (currentCard.type === "Regular") {
			 regularBoxBack.style.display = "flex"; // back page show✨
			 regularBoxBack.classList.add("active"); // light up
		 } else if (currentCard.type === "Irregular") {
			 irregularBoxBack.style.display = "flex"; // back page show💣
			 irregularBoxBack.classList.add("active"); // light up
		 }
		backSentence.textContent = currentCard.sentence2;
		document.getElementById('back-sentence').innerHTML = currentCard.sentence2

		.replace(/\((.*?)\)/g, "<mark>$1</mark>")
    
    // bold the mark up
    	.replace(/\{(.*?)\}/g, "<mark><strong>$1</strong></mark>")
    
    // [] red color word
    	.replace(/\[([^\]]+?)\]/g, "<span class='red'>$1</span>");

		document.getElementById('hint-text').textContent = currentCard.hint; 



		const wordElement = document.getElementById('back-word');
		
		const workMarkUp = currentCard.wordMarkUp.charAt(0).toUpperCase() + currentCard.wordMarkUp.slice(1);
		wordElement.innerHTML = workMarkUp
    		.replace(/\((.*?)\)/g, "<mark style='background-color: yellow;'>$1</mark>") // highlight ()
    		.replace(/\[([^\]]+?)\]/g, "<span class='red'>$1</span>") // red text []
    		.replace(/\{(.*?)\}/g, "<strong>$1</strong>"); // bold {}




		backDefinition.textContent = currentCard.definition;

		if (currentCard.image) {
			backImage.src = currentCard.image;
			backImage.style.display = "block";
		} else {
			backImage.style.display = "none";
		}

		if (currentCard.image2) {
			backImage2.src = currentCard.image2;
			backImage2.style.display = "block";
		} else {
			backImage2.style.display = "none";
		}

		

		if (currentCard.audio) {
			backAudio.src = currentCard.audio;
			backAudio.style.display = "block";
		} else {
			backAudio.style.display = "none";
		}

		if (currentCard.type === "Regular") {
			document.getElementById("regular-box-back").style.display = "flex"; // 後頁顯示✨
		} else if (currentCard.type === "Irregular") {
			document.getElementById("irregular-box-back").style.display = "flex"; // 後頁顯示💣
		}

	}, transitionHalfDuration);

	updateEntries();
}

/** Navigates to the previous card. */
function previousCard() {
	currentIndex = (currentIndex - 1 + cards.length) % cards.length;
}

/** Navigates to the next card. */
function nextCard() {
	currentIndex = (currentIndex + 1) % cards.length;
}

document.getElementById("btn-back").addEventListener("click", () => {
	previousCard();
	renderCard();
});
document.getElementById("btn-skip").addEventListener("click", () => {
	nextCard();
	renderCard();
});

/**
 * Mapping between the user's selection (Again, Good, Easy) and the number of days to wait before reviewing the card again.
 */
const dayOffset = { again: 1, good: 3, easy: 7 };

/**
 * Records learning progress by updating the card's due date based on the user's selection (Again, Good, Easy).
 */
function updateDueDate(type) {
	const card = cards[currentIndex];
	const today = new Date();
	const dueDate = new Date(today.setDate(today.getDate() + dayOffset[type]) - today.getTimezoneOffset() * 60 * 1000);
	(progressData[card.id] ||= {}).dueDate = dueDate.toISOString().split("T")[0]; // Print the date in YYYY-MM-DD format
	saveProgress(progressData);
	updateEntries();
}

document.getElementById("btn-again").addEventListener("click", () => {
	updateDueDate("again");
	nextCard();
	renderCard();
});
document.getElementById("btn-good").addEventListener("click", () => {
	updateDueDate("good");
	nextCard();
	renderCard();
});
document.getElementById("btn-easy").addEventListener("click", () => {
	updateDueDate("easy");
	nextCard();
	renderCard();
});

// Initial render
initEntries();
renderCard();