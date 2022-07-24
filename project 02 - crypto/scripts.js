(function () {
    $(function () {

        let coinsArrey = new Array();                            //An array of all the coins for the search
        let saveValOfCoins = new Set();                          //Retain the value for 2 minutes

        let checkedCoinsIDsMap = new Map();                       //Coin selection
        const maxSelectedInArray = 5;                           //Max coins that can be marked at the same time


        //-------------------bar--------------------------//

        $("document").ready(function () {
            onHomePage()
            $("#searchWords").val("click here to search");
        });

        $("#home").click(function () {
            $("#body").empty();
            coinsArrey.splice(0, 50);
            saveValOfCoins.clear();
            onHomePage()
        })

        function onHomePage() {
            let imgUp = $(`<br><br> <div id="imgUp"></div>`);
            $("#body").append(imgUp);

            let coinContainer = $(`<br><br><p class = "warning" >Every 2 minutes, the data hide</p>
            <div class="coin-container">
            </div>`);
            $("#body").append(coinContainer);
            let url = `https://api.coingecko.com/api/v3/coins`;

            getcoinFromServer(url)
        }

        $("#about").click(function () {
            $("#body").empty();
            saveValOfCoins.clear();
            onAboutPage()
        })

        function onAboutPage() {
            let about = $(`
            <br>
            <h2>About me</h2>
            <br>
            <img src="./img/me2.jpeg" class="me">
            <br><br> 
            <p class="aboutMe"> my name is itzhak jan, I 23 years old</p>
            <p class="aboutMe"> My bigest problems in projeckt was: 
            <br>
            1. Synchronization between the button of more information and the currency it is on
            <br>
            2. Change the marking of the coins on the page itself after the closing of the model 
            (and after search / return to the home page)
            <br>
            3. Creating an updated graph from the server - 
            I thought it would be relatively easy because we already know canvas but it turns out not ☹
            </p>
             </p>   
             <br> 
            <nav>
                <h3>Contact Us:</h3>
                <div cellphone:><li> phone: 050-6611659</li></div>
                <div send-mail:><li>
                <a href="mailto:itzhakj1@gmail.com"><img src="./img/gmail-logo.png" class="logo"></a></li></div>
                <br>
                <div facebook:><li><a href="https://www.facebook.com/profile.php?id=100008349317830">
                <img src="./img/Facebook_Logo.png" class="logo"></li>
                </div>
            </nav>`);
            $("#body").append(about);
        }

        $("#live-reports").click(function () {
            $("#body").empty();
            saveValOfCoins.clear();
            onLiveReports()
        })

        function onLiveReports() {

            if (checkedCoinsIDsMap.size == 0) {
                $("#body").append(` <br><br> <h2> oops....forgot choose any coin...</h2>
                <br> <img src="./img/shrekCat.jpg"><br>`);
            }
            else {
                $("#body").empty()
                $("#body").append(`<div id="chartContainer" style="height: 320px; width: 100%;"></div>`)
                graph()
            }
        }


        //-------------------search--------------------------//
        $("#searchWords").click(function () {
            $("#searchWords").val("");
        })
        $("#searchWords").keyup(function (event) { // Calls search function on "Enter" click. 
            let keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                searchfunction();
            }
        });

        function searchfunction() {
            $(".coin-container").empty();
            saveValOfCoins.clear();               //Reset a panel for more information so that it can be reopened
            let search = $("#searchWords").val();
            let chosenCoins = coinsArrey.filter(function (coin) {
                return coin.symbol.toLowerCase().includes(search.toLowerCase()) ||
                    coin.name.toLowerCase().includes(search.toLowerCase());
            })
            $(".coin-container").empty();
            createCoinToUi(chosenCoins);
            $("#searchWords").val("");
        }

        $("#searchWords").blur("click", function () {
            $("#searchWords").val("click here to search");
        })

        //-------------------home page function--------------------------//


        function getcoinFromServer(url) {
            $.get(url).then(
                function (coins) {
                    coins.forEach(index => coinsArrey.push(index))    //Puts the coins in an array for the search
                    createCoinToUi(coinsArrey);
                })
                .catch(() => alert("The connection failed"))
        }

        function createCoinToUi(coins) {
            for (let coin of coins) {
                let coinCard = $(`<div id = "coin${coin.id}"; class = "coin-Card">
                    <div class="coin-name">${coin.name}</div>
                    <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
                    </div>`);

                let switchButton = $(`<label class="switch">
                <input type="checkbox"
                class="checkbox-coin"
                id="check_${coin.id}">
                <span class="slider round"></span></label>`)

                // The ID starts with a check_ to differentiate from the ID in the model

                let moreInfo = $(`<button class="more-info">more-info</button>`)

                //put switchButton and moreInfo to coinCard, and coinCard to screen
                $(coinCard).append(switchButton);
                $(coinCard).append(moreInfo);
                $(".coin-container").append(coinCard);

                moreInfo.on("click", () => getMoreInfo(coin.id));

                $('.checkbox-coin').click(checkToggle);

                //Check if one of the coins should be marked, and if so mark it on the screen
                syncCoinsMarkedOnScreen()

            }
        }

        function getMoreInfo(id) {

            if (saveValOfCoins.has(id)) {                //Check if the information is already saved
                changeInfoOnCoinCard(id)
            }
            else {
                $.get(`https://api.coingecko.com/api/v3/coins/${id}`).then(function (coin) {

                    let info = $(`<div class="data_market" id="data-market${id}">
                    ${coin.market_data.current_price.usd}  $ <br>
                    ${coin.market_data.current_price.eur}  € <br>
                    ${coin.market_data.current_price.ils}  ₪
                    </div>`);
                    saveValOfCoins.add(id)
                    setTimeout(() => { saveValOfCoins.delete(id); $(".data_market").empty() }, 120 * 1000)
                    $(`#coin${id}`).append(info)
                })
            }
        }

        function changeInfoOnCoinCard(id) {               //Show / hide according to status
            let coinVal = $(`#data-market${id}`)
            const currentDisplayVal = coinVal.css("display")

            if (currentDisplayVal == `block`) {
                coinVal.hide();
            }
            else { coinVal.show() }
        }


        //-------------------Toggle and modal--------------------------//

        function checkToggle() {
            let coinCardID = this.id.substring(6, this.id.length);
            if ($(this).prop("checked") == true) {
                if (checkedCoinsIDsMap.size > maxSelectedInArray) {
                    //unchecked last toggle
                    checkedCoinsIDsMap.set(coinCardID, "unchecked");
                    $(this).prop("checked", false);
                    //open modal
                    openModalW();

                } else {
                    checkedCoinsIDsMap.set(coinCardID, "checked");
                }
            } else if ($(this).prop("checked") == false) {
                //delete from map unchecked toggle on parent W
                deleteToggleFromMap(coinCardID);
            }
        };//end of checkToggle()

        function openModalW() {
            let coinsIdsKeysIter = checkedCoinsIDsMap.keys();
            $(".modal-selected-coins").empty();
            let currentKey = [...checkedCoinsIDsMap.keys()];                      // An array of all the keys of the map
            for (let i = 0; i < currentKey.length; i++) {
                let toggleId = "checkM_" + currentKey[i];
                let toggleBtn = `<div class="modal-list">
                    <div class="coin-body">${currentKey[i]}</div>
                    <label class="switch">
                        <input type="checkbox" class="checkboxModalW" id=${toggleId}>
                        <span class="slider round"></span>
                    </label>
                    </div>`;
                $(".modal-selected-coins").append(toggleBtn);
                if (checkedCoinsIDsMap.get(currentKey[i]) == "checked") {
                    $(`#${toggleId}`).prop("checked", true);
                } else {
                    $(`#${toggleId}`).prop("disabled", false);
                }
            }
            $(".modal").modal("show");
            //click toggle in modal 
            $('.checkboxModalW').click(checkToggleOnModal);
        };//end of openModalW()

        function checkToggleOnModal() {
            let coinCardID = this.id.substring(7, this.id.length);

            if ($(this).prop("checked") == true) {
                checkedCoinsIDsMap.set(coinCardID, "checked");
                let currentKey = [...checkedCoinsIDsMap.keys()];                      // An array of all the keys of the map
                for (let i = 0; i < currentKey.length; i++) {
                    let toggleId = "checkM_" + currentKey[i];
                    if (checkedCoinsIDsMap.get(currentKey[i]) == "unchecked") {
                        $(`#${toggleId}`).prop("disabled", true);
                    }
                }
            } else {//unchecked
                checkedCoinsIDsMap.set(coinCardID, "unchecked");
                let currentKey = [...checkedCoinsIDsMap.keys()];                      // An array of all the keys of the map
                for (let i = 0; i < currentKey.length; i++) {
                    let toggleId = "checkM_" + currentKey[i];
                    if (checkedCoinsIDsMap.get(currentKey[i]) == "unchecked") {
                        $(`#${toggleId}`).prop("disabled", false);
                    }
                }
            }
        };//end of checkToggleOnModal()

        function deleteToggleFromMap(coinCardID) {
            let currentKey = [...checkedCoinsIDsMap.keys()];                      // An array of all the keys of the map
            for (let i = 0; i < currentKey.length; i++) {
                // console.log(checkedCoinsIDsMap);
                console.log(coinCardID);

                console.log(currentKey[i]);

                if (currentKey[i] == coinCardID) {
                    checkedCoinsIDsMap.delete(currentKey[i]);

                }
            }
            // console.log(checkedCoinsIDsMap);
        };//end of deleteToggleFromMap()

        $('#saveBtn').on('click', syncCoinsMarkedOnScreen);

        function syncCoinsMarkedOnScreen() {
            let deletedId;
            currentKey = [...checkedCoinsIDsMap.keys()];
            console.log(currentKey);
            // An array of all the keys of the map
            for (let i = 0; i < currentKey.length; i++) {
                let toggleId = "check_" + currentKey[i];
                console.log(currentKey);
                if (checkedCoinsIDsMap.get(currentKey[i]) == "checked") {
                    $(`#${toggleId}`).prop("checked", true);
                } else {
                    $(`#${toggleId}`).prop("checked", false);
                    deletedId = currentKey[i];
                    deleteToggleFromMap(deletedId);
                }
            }

            $(".modal").modal("hide");
            if (checkedCoinsIDsMap.size > maxSelectedInArray) {
                //open modal agein
                openModalW();
            }
        };//end of saveModalChoises()


        //-------------------live reports function--------------------------//

        function graph() {
            let graphArrays = [dpsOne = [], dpsTwo = [], dpsThree = [], dpsFour = [], dpsFive = []]           //An array of parameters per coin
            let arrayOfChosenCoins = [...checkedCoinsIDsMap.keys()];                      // An array of all the keys of the map

            let chart = new CanvasJS.Chart("chartContainer", {                 //create graph
                title: {
                    text: "Crypto value over time"
                },
                axisX: {
                    title: "Time"
                },
                axisY: {
                    title: "value in dollar"
                },
                legend: {
                    cursor: "pointer",
                    fontSize: 16,
                    itemclick: toggleDataSeries
                },
                data: [{                                            //create parameters per coin
                    type: "line",
                    dataPoints: dpsOne,
                    name: arrayOfChosenCoins[0],
                    yValueFormatString: "#0.## $",
                    showInLegend: true,
                },
                {
                    type: "line",
                    dataPoints: dpsTwo,
                    name: arrayOfChosenCoins[1],
                    yValueFormatString: "#0.## $",
                    showInLegend: true,
                },
                {
                    type: "line",
                    dataPoints: dpsThree,
                    name: arrayOfChosenCoins[2],
                    yValueFormatString: "#0.## $",
                    showInLegend: true,
                },
                {
                    type: "line",
                    dataPoints: dpsFour,
                    name: arrayOfChosenCoins[3],
                    yValueFormatString: "#0.## $",
                    showInLegend: true,
                },
                {
                    type: "line",
                    dataPoints: dpsFive,
                    name: arrayOfChosenCoins[4],
                    yValueFormatString: "#0.## $",
                    showInLegend: true,
                }]
            });

            let xVal = 0;
            let yVal = 0;
            let updateInterval = 2000;                             //Update speed
            let dataLength = 20;                                  // number of dataPoints visible at any point

            function toggleDataSeries(e) {                     //Hides the coin when pressed
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                }
                else {
                    e.dataSeries.visible = true;
                }
                chart.render();
            }

            let updateChart = function (count) {             //Update valeu
                count = count || 1;

                for (let index = 0; index < arrayOfChosenCoins.length; index++) {
                    let url = `https://api.coingecko.com/api/v3/coins/${arrayOfChosenCoins[index]}`;
                    $.get(url).then((coinObject) => {
                        yVal = coinObject.market_data.current_price.usd;
                        graphArrays[index].push({
                            x: xVal,
                            y: yVal,
                        });
                    })
                        .catch(e => alert(e.message));
                    xVal += 2;
                }
                for (let index = 0; index < checkedCoinsIDsMap.size; index++) {
                    if (graphArrays[index].length > dataLength) {
                        graphArrays[index].shift();
                    }
                }
                chart.render();
            };

            updateChart(dataLength);                            //Update graph
            setInterval(function () { updateChart() }, updateInterval);
        }

    });
})();

