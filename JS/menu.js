(function() {
    function toggleDropdown(dropdownId) {
        document.getElementById(dropdownId).classList.toggle("show");
    }

    window.myFunction1 = function() {
        toggleDropdown("myDropdown1");
    };

    window.myFunction2 = function() {
        toggleDropdown("myDropdown2");
    };

    window.myFunction3 = function() {
        toggleDropdown("myDropdown3");
    };

    window.myFunction4 = function() {
        toggleDropdown("myDropdown4");
    };

    // Close the dropdown if the user clicks outside of it
    window.onclick = function(e) {
        if (!e.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            for (var d = 0; d < dropdowns.length; d++) {
                var openDropdown = dropdowns[d];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    };
})();
