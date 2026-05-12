/* ============================================================== 
   MANNY'S COMEDY SITE LOGIC 
   This file handles actions, like updating the copyright year 
   and making the "Share My Page" button work on mobile phones.
   ============================================================== */

// 1. AUTO-UPDATE COPYRIGHT YEAR
// This looks at the HTML element with the id "year" and updates it to the current year.
document.addEventListener("DOMContentLoaded", function() {
    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// 2. NATIVE SHARE FUNCTION
// This triggers the built-in share menu on iPhones and Androids.
async function sharePage() {
    const shareData = {
        title: 'Manny Serrano | Stand-Up Comedian',
        text: 'Check out Manny Serrano - Tampa based Stand-Up Comedian.',
        url: window.location.href // This automatically grabs your current website link
    };

    // If the device supports native sharing (like a phone)
    if (navigator.share) {
        try { 
            await navigator.share(shareData); 
        } catch (err) { 
            console.log('User canceled the share menu.'); 
        }
    } else {
        // If they are on a desktop without native sharing, just copy the link
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard! You can paste it anywhere to share.");
    }
}
