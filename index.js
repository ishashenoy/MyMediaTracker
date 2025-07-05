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
     document.documentElement.style.overflow = "auto";
}

function hide(elmnt){
    let x = document.getElementById(elmnt);
    x.style.display = "none";
    document.documentElement.style.overflow = "hidden";
    document.querySelectorAll('*').forEach(el => el.style.overflow = 'hidden');
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


document.addEventListener('DOMContentLoaded', async () => {
  try{
    media = ['anime'];

    for(let mediatype of media){
      topUrl = `https://api.jikan.moe/v4/top/${mediatype}?limit=10&sfw=true`;

      const response = await fetch(topUrl);
      if(!response.ok){
          throw new Error("could not fetch resource");
      }

      const results = await response.json();

      let mediaList = results.data;

      console.log(mediaList);

      document.getElementById(`top-${mediatype}`).innerHTML = "";

      for (let media of mediaList){
        //make media card object
        let mediaCard = document.createElement('div');
        mediaCard.classList.add("search-result");
        mediaCard.classList.add("top-element");

        let title, image;

        title = media.title;
        image = media.images.jpg.image_url;

        let imgEl = document.createElement('img');
        imgEl.src = image;
        mediaCard.appendChild(imgEl);

        let titleEl = document.createElement('p');
        titleEl.classList.add("title");
        titleEl.innerText = title;
        mediaCard.appendChild(titleEl);

        mediaCard.addEventListener('click', function(){
          let hero = document.querySelector('.hero');
          hero.style.backgroundImage = `url("${image}")`;
        });

        document.getElementById(`top-${mediatype}`).appendChild(mediaCard);
      }
    }
  }
  catch(error){
      console.error(error);
  }
});