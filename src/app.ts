import axios from "axios";

const GOOGLE_KEY = "AIzaSyAr7giK48iEtEsNdqfUMzHOak_dVd_O9EA";
const GOOGLE_URI = "https://maps.googleapis.com/maps/api/geocode/json";

type Position = { lat: number; lng: number };
type GoogleResponse = {
  data: {
    results: {
      formatted_address: string;
      geometry: {
        location: {
          lat: number;
          lng: number;
        };
      };
    }[];
    status: "OK" | "ZERO_RESULTS";
  };
};

declare var google: any;
let map: any;
let marker: any;

async function initMap(): Promise<void> {
  const position = { lat: 45.515232, lng: -122.6783853 };
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("map"), {
    zoom: 3,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
}

async function addMarker(position: Position, address: string) {
  // Center on new position
  map.setCenter(position);
  map.setZoom(15);

  // Destroy old marker
  if (marker) {
    marker.setMap(null);
  }

  // Create new marker
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: address,
  });
}

function initBinding() {
  const formElement = document.getElementById("search")!;
  const addressElement = document.getElementById(
    "address"
  )! as HTMLInputElement;
  const errorElement = document.querySelector("#error p")!;

  formElement.addEventListener("submit", (event: Event) => {
    event.preventDefault();

    const address = addressElement.value;
    const uri = `${GOOGLE_URI}?address=${encodeURI(address)}&key=${GOOGLE_KEY}`;
    axios
      .get(uri)
      .then((response: GoogleResponse) => {
        if (response.data.status === "OK") {
          // handle success
          errorElement.textContent = "";
          const position = response.data.results[0].geometry
            .location as Position;
          const formatted_address = response.data.results[0].formatted_address;
          addMarker(position, formatted_address);
        } else {
          errorElement.textContent = `Cannot find "${address}"`;
        }
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  });
}

initMap();
initBinding();
