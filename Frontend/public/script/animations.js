function displayPastList(){
    document.getElementById("pt-list").classList.toggle("hide");
}
function displayPresentAndUpcomingList(){
    document.getElementById("pu-list").classList.toggle("hide");  
}



window.addEventListener('load', () => {
  const counterElement = document.getElementById('trained-people');
  const targetNumber = 100; // The 'n' trained people
  const duration = 2000; // Animation duration in milliseconds
  const intervalTime = 20; // Step time
  
  let startValue = 0;
  const increment = targetNumber / (duration / intervalTime);

  const counterInterval = setInterval(() => {
    startValue += increment;
    if (startValue >= targetNumber) {
      counterElement.textContent = targetNumber.toLocaleString();
      clearInterval(counterInterval);
    } else {
      counterElement.textContent = Math.floor(startValue).toLocaleString();
    }
  }, intervalTime);
});

// window.addEventListener('load', () => {
//   const counterElement = document.getElementById('students');
//   const targetNumber = 500; // The 'n' trained people
//   const duration = 2000; // Animation duration in milliseconds
//   const intervalTime = 20; // Step time
  
//   let startValue = 0;
//   const increment = targetNumber / (duration / intervalTime);

//   const counterInterval = setInterval(() => {
//     startValue += increment;
//     if (startValue >= targetNumber) {
//       counterElement.textContent = targetNumber.toLocaleString(); // Add commas
//       clearInterval(counterInterval);
//     } else {
//       counterElement.textContent = Math.floor(startValue).toLocaleString();
//     }
//   }, intervalTime);
// });