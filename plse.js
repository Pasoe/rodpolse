	const path = window.location.pathname;
	
	// Get references to your elements
	const polseImg = document.getElementById("polse");
	const resetPolseImg = document.getElementById("resetPolse");
	const noPolseBigText = document.getElementById("noPolseBigText");
	const noPolseSmallText = document.getElementById("noPolseSmallText");

	const polseSrc = "./rodpolse6.png";
	const resetSrc = "favicon-32x32.png";
	const resetHoverSrc = "brokenPolse.png";

	// Define configuration for each path
	const pathConfig = {
	  "/": {
		bigText: "Big Rød Pølses don’t spin. Unhack and Rød Pølse will spin.",
		smallText: "Small Rød Pølses don’t spin. Unhack and Rød Pølse will spin."
	  },
	  "/msh/": {
		bigText: "Big Mads don’t spin. Unhack and Mads will spin.",
		smallText: "Small Mads don’t spin. Unhack and Mads will spin."
	  }
	};
	
	// Pick config based on current path, fallback to root config
	const config = pathConfig[path] || pathConfig["/"];

	// Apply images and text
	polseImg.src = polseSrc;
	resetPolseImg.src = resetSrc;
	noPolseBigText.textContent = config.bigText;
	noPolseSmallText.textContent = config.smallText;

	// Handle hover effect dynamically
	resetPolseImg.addEventListener("mouseover", () => {
	  resetPolseImg.src = resetHoverSrc;
	});
	resetPolseImg.addEventListener("mouseout", () => {
	  resetPolseImg.src = resetSrc;
	});

    // Load the saved count (if any)
    let savedRotationCount = parseInt(localStorage.getItem('rotationCount')) || 0;
	let savedRotationTime = parseFloat(localStorage.getItem('rotationTime')) || 0;
	let displayedRotations = 0;
	let fastestRotation = null;
	
	// setSavedData
	if (savedRotationCount > 0 && savedRotationTime > 0) {
		displayedRotations = savedRotationCount;
		fastestRotation = savedRotationTime;
	}
	
	function updatePolseData(rotationCountToSave, fastestRotationToSave) {
		// Persist rotation count every time it changes
		if (rotationCountToSave !== savedRotationCount) {
			localStorage.setItem('rotationCount', rotationCountToSave);
			savedRotationCount = rotationCountToSave;
		}

		// Persist fastest rotation if first time or improved
		if (!savedRotationTime || fastestRotationToSave < savedRotationTime) {
			localStorage.setItem('rotationTime', fastestRotationToSave);
			savedRotationTime = fastestRotationToSave;
		}
	}
	
	function clearPolseData() {

		localStorage.removeItem('rotationTime');
		localStorage.removeItem('rotationCount');

		displayedRotations = 0;
		fastestRotation = null;

		document.getElementById("rotationCount").textContent = displayedRotations;
		document.getElementById("fastestRotation").textContent = "—";
	}
	

	const img = document.getElementById('polse');
	let unpolse = false;
	
	function updatePolse(unPolse, isBig) {
		unpolse = unPolse;
		
		if(unpolse){
			if(isBig) {
				document.getElementById("noPolseBig").style.display = "block";
			}
			else {
				document.getElementById("noPolseSmall").style.display = "block";
			}
			
			document.getElementById("rotationDisplay").style.display = "none";
		} else {
			document.getElementById("noPolseBig").style.display = "none";
			document.getElementById("noPolseSmall").style.display = "none";
			document.getElementById("rotationDisplay").style.display = "block";
		}
	}

	function isMobile() {
	  const ua = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	  const touch = window.matchMedia("(pointer: coarse)").matches;
	  return ua || touch;
	}

	function checkZoom() {
      const zoom = Math.round(window.devicePixelRatio * 100);
      // You can also use: const zoom = Math.round((window.outerWidth / window.innerWidth) * 100);
	  
      if (!isMobile() && zoom !== 100) {
        // Hide or remove image when zoom is detected
		updatePolse(true, zoom > 100);
      } else {
        // Restore image if zoom returns to 100%
		updatePolse(false);
      }
    }

    // Detect zoom when resizing or zooming
    window.addEventListener('resize', checkZoom);
    window.addEventListener('load', checkZoom);
	
	const resetButton = document.getElementById('resetPolse');

	  // Add a click event listener
	  resetButton.addEventListener('click', function() {
		clearPolseData();
	  });


gsap.registerPlugin(Draggable);

const image = document.querySelector("#polse");

// --- Initial state ---
let velocity = 0.025; // Spin speed
let rotation = gsap.utils.random(0, 360); // Start angle
let cumulativeDegrees = 0;

let prevRotation = rotation;
let lastFullRotationTime = performance.now();


// --- Rotation tracker ---
function normalizeDelta(delta) {
  return ((delta + 180) % 360) - 180;
}

function trackRotation(newRot) {
  const delta = normalizeDelta(newRot - prevRotation);
  cumulativeDegrees += delta;
  prevRotation = newRot;

  let didFullRotation = false;

  // Handle one or more full spins since last frame
  while (Math.abs(cumulativeDegrees) >= 360) {
    cumulativeDegrees -= Math.sign(cumulativeDegrees) * 360;
    didFullRotation = true;

    const now = performance.now();
    const timePerRotation = (now - lastFullRotationTime) / 1000; // seconds
    lastFullRotationTime = now;

    // update fastestRotation immediately
    if (!fastestRotation || timePerRotation < fastestRotation) {
      fastestRotation = timePerRotation;
    }

    displayedRotations++;
  }

  // Show rotation display only when needed
  if (didFullRotation || (displayedRotations && fastestRotation)) {
    document.getElementById("rotationDisplay").style.display = "block";
  }

  // Sync UI
  document.getElementById("rotationCount").textContent = displayedRotations;
  document.getElementById("fastestRotation").textContent =
    fastestRotation ? fastestRotation.toFixed(4) + "s" : "—";

  // Save results
  updatePolseData(displayedRotations, fastestRotation);
}

// --- Rotation updater ---
function updateRotation() {
  if(unpolse){ return; }
  rotation += velocity;
  gsap.set(image, { rotation: rotation });
  trackRotation(rotation);

  velocity *= 0.9915; // friction

  if (Math.abs(velocity) < 0.001) {
    velocity = 0;
  }
}

gsap.ticker.add(updateRotation);

// --- Gesture control ---
let lastAngle = null;
let center = { x: 0, y: 0 };

// Draggable (used only for pointer tracking, NOT rotation)
Draggable.create(image, {
  type: "x,y", // prevent Draggable from handling rotation
  onPress() {
    const rect = image.getBoundingClientRect();
    center.x = rect.left + rect.width / 2;
    center.y = rect.top + rect.height / 2;

    const dx = this.pointerX - center.x;
    const dy = this.pointerY - center.y;
    lastAngle = Math.atan2(dy, dx);
  },
  onDrag() {
    const dx = this.pointerX - center.x;
    const dy = this.pointerY - center.y;
    const angle = Math.atan2(dy, dx);

    let deltaAngle = angle - lastAngle;

    // Normalize to [-PI, PI]
    if (deltaAngle > Math.PI) deltaAngle -= Math.PI * (2/100);
    if (deltaAngle < -Math.PI) deltaAngle += Math.PI * (2/100);

	if(!unpolse) {
      // Add angular velocity
      velocity += deltaAngle * 5; // sensitivity factor
	}
	
    lastAngle = angle;
  },
  allowContextMenu: true
});