function exportData(){
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    console.log(watchlist);

    const jsonString = JSON.stringify(watchlist, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.json';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}    

function show(elmnt){
    let x = document.getElementById(elmnt);
     x.style.display = "block";
    document.documentElement.style.overflow = "hidden";
    document.querySelectorAll('*').forEach(el => el.style.overflow = 'hidden');
}

function hide(elmnt){
    let x = document.getElementById(elmnt);
    x.style.display = "none";
    document.documentElement.style.overflow = "auto";
}

let jsonData;

document.getElementById("file").addEventListener("change", async function(event) {
  const file = event.target.files[0]; 
  if (file) {
    jsonData = await parseJsonFile(file); 
    console.log(jsonData);
    localStorage.setItem('watchlist', JSON.stringify(jsonData));
    alert('File upload complete!');
  }
});


async function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = event => resolve(JSON.parse(event.target.result))
    fileReader.onerror = error => reject(error)
    fileReader.readAsText(file)
  })
}

// SEARCH PAGE
async function fetchData(){
    const filter = document.getElementById("search-filter-select").value;
    try{
        const mediaName = document.getElementById('search-input').value.trim().toLowerCase();
        
        let mediaUrl;

        if(filter==="anime" || filter==="manga"){
            mediaUrl = "https://api.jikan.moe/v4/" + filter + "?q=" + mediaName +"&sfw=true";
        } else if(filter==="tv"){
            mediaUrl = "https://api.tvmaze.com/search/shows?q=" + mediaName ;
        } else if(filter==="game"){
            mediaUrl = mediaUrl = `https://api.rawg.io/api/games?key=309aa4424a8849b3870b737c2c710574&search=${mediaName}&page_size=20`;
        }

        const response = await fetch(mediaUrl);
        if(!response.ok){
            throw new Error("could not fetch resource");
        }

        const result = await response.json();

        let mediaList;
        if (filter === "anime" || filter === "manga") {
            mediaList = result.data;
        } else if (filter === "tv") {
            mediaList = result;
        } else if (filter==="game"){
            mediaList = result.results;
        }

        console.log(mediaList);

        document.getElementById('search-results-container').innerHTML = "";

        for (let media of mediaList){
            //make media card object
            let mediaCard = document.createElement('div');
            mediaCard.classList.add("search-result");
            mediaCard.setAttribute("data-type",filter);

            let title, url, image, year,score;

            if(filter==="tv"){
                title = media.show.name;
                url = media.show.url;
                image = media.show.image.medium;
                year = media.show.premiered.substr(0,4);
                score = media.show.rating.average;
            } else if(filter==="anime" || filter==="manga"){
                title = media.title_english || media.title;
                url = media.url;
                image = media.images.jpg.image_url;
                year = media.year;
                score = media.score;
            } else if(filter==="game"){
                title = media.name;
                url = `https://rawg.io/games/${media.slug}`;
                image = media.background_image;
                year = media.released.substr(0, 4);
                score = media.rating;
            }

            mediaCard.setAttribute("data-title",title);
            mediaCard.setAttribute("data-url",url);
            mediaCard.setAttribute("data-image", image);

            let addToListButton = document.createElement('div');
            addToListButton.innerText = "+";
            addToListButton.classList.add("addToList-button");
            addToListButton.addEventListener('click', async () => {
                let episodes;
                if(filter==="tv"){
                    const responseTvEpisodes = await fetch("https://api.tvmaze.com/shows/"+media.show.id+"/episodes");
                    if(!responseTvEpisodes.ok){
                        throw new Error("could not fetch resource");
                    }

                    let episodelist = await responseTvEpisodes.json();
                    episodes = episodelist.length;
                } else{
                    episodes = media.episodes || "?";
                }

                const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
                const mediaItem = {type: filter, title: title, url: url, image: image, episodes:episodes, status:null, rating:null, progress:null};
                
                const exists = watchlist.some(item => 
                    item.title === mediaItem.title && item.type === mediaItem.type
                );

                if (!exists) {
                    watchlist.push(mediaItem);
                    localStorage.setItem('watchlist', JSON.stringify(watchlist));
                    alert(`${title} added to your list!`);
                } else {
                    alert(`${title} is already in your list!`);
                }
            });
            mediaCard.appendChild(addToListButton);

            let imgEl = document.createElement('img');
            imgEl.src = image;
            mediaCard.appendChild(imgEl);

            let titleEl = document.createElement('a');
            titleEl.classList.add("title");
            titleEl.target = "_blank";
            titleEl.href = url;
            titleEl.innerText = title;
            mediaCard.appendChild(titleEl);

            let tagContainer = document.createElement('div');
            tagContainer.classList.add("tag-container");

            if(score!=undefined && score!=null){
                let scoreTag = document.createElement('p');
                scoreTag.classList.add("tag");
                scoreTag.innerText = score+"⭐";
                tagContainer.appendChild(scoreTag);
            }

            if(year!=undefined && year!=null){
                let yearTag = document.createElement('p');
                yearTag.classList.add("tag");
                yearTag.innerText = `Year: ${year}`;
                tagContainer.appendChild(yearTag);
            }
            
            mediaCard.appendChild(tagContainer);

            document.getElementById('search-results-container').appendChild(mediaCard);
        }
    }
    catch(error){
        console.error(error);
    }

}

document.getElementById('search-input').onkeydown = function(e){
   if(e.keyCode == 13){
    fetchData();
   }
};