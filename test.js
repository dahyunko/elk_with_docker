import { css } from "@emotion/css";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { getPOIs } from "../apis/Map";

var { Tmapv2 } = window;

function TMapPage() {
  const [map, setMap] = useState(null);

  const [markers, setMarkers] = useState([]); // 장소 정보 관리
  const [keyword, setKeyword] = useState(""); // 검색어
  const [selectedCategory, setSelectedCategory] = useState("카페");
  const [clickedPlace, setClickedPlace] = useState(null); // 선택된 장소

  useEffect(() => {

    const initTmap = async () => {
      try {
        // Tmapv2 = await loadTmapScript();
        const newMap = new Tmapv2.Map("map_div", {
          center: new Tmapv2.LatLng(37.5652045, 126.98702028),
          width: "100%",
          height: "100vh",
          zoom: 17,
        });
        newMap.setOptions({ zoomControl: false });
        setMap(newMap);
      } catch (error) {
        console.error("Tmap script load error:", error);
      }
    };
    // console.log(markers);
    initTmap();
  }, [markers]);

  const search = async () => {
    if (!map) return;

    const data = {
      searchKeyword: keyword,
      resCoordType: "EPSG3857",
      reqCoordType: "WGS84GEO",
      count: 10,
    };

    const response = await getPOIs(data);
    var resultpoisData = response.searchPoiInfo.pois.poi;

    // console.log(resultpoisData);

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]); // 기존 마커를 제거하고 상태 초기화

    var positionBounds = new Tmapv2.LatLngBounds(); //맵에 결과물 확인 하기 위한 LatLngBounds객체 생성

    const newMarkers = resultpoisData.map((poi, index) => {
      console.log(poi);
      const pointCng = new Tmapv2.Point(
        Number(poi.noorLon),
        Number(poi.noorLat)
      );
      const projectionCng =
        Tmapv2.Projection.convertEPSG3857ToWGS84GEO(pointCng);

      const lat = projectionCng._lat;
      const lon = projectionCng._lng;
      const markerPosition = new Tmapv2.LatLng(lat, lon);

      var marker = new Tmapv2.Marker({
        position: markerPosition,
        icon:"/Marker.png",
        map: map,
      });

      positionBounds.extend(markerPosition); // LatLngBounds의 객체 확장
      console.log(marker);
      return marker;
    });
    setMarkers(newMarkers); // 마커 상태 업데이트
    map.fitBounds(positionBounds); // 지도 중심과 확대 조정
    console.log(markers);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setKeyword(e.target.value);
      search();
    }
  };

  return (
    <div
      className={css`
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100vh;
      `}
    >
      <div
        className={css`
          position: absolute;
          top: 1.5rem;
          width: 90%;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          z-index: 2;
        `}
      >
        <div
          className={css`
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
          `}
        >
          <input
            type="text"
            className={css`
              top: 1.5rem;
              width: 90%;
              height: 2.5rem;
              padding-inline: 1rem;
              border-radius: 0.8rem;
              border: solid #d9d9d9 0.1rem;
              box-shadow: 0 5.2px 6.5px rgb(0, 0, 0, 0.1);
              font-size: 1.2rem;
              color: #474747;
              z-index: 2;
              &:focus {
                outline: none;
              }
            `}
            onKeyDown={(e) => handleKeyDown(e)}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <img
            src="/search.svg"
            alt=""
            className={css`
              position: absolute;
              right: 1rem;
              z-index: 2;
            `}
            onClick={() => search()}
          />
        </div>
        <div
          className={css`
            margin-top: 1rem;
            width: 90%;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            z-index: 2;
          `}
        >
          {["카페", "음식점", "편의점", "주유소", "문화시설", "대형마트"].map(
            (text, index) => (
              <div
                key={index}
                className={css`
                  --height: 2rem;
                  background-color: ${selectedCategory === text
                    ? "#979797"
                    : "white"};
                  line-height: var(--height);
                  height: var(--height);
                  padding: 0 1rem;
                  margin-right: 0.5rem;
                  margin-bottom: 0.4rem;
                  border-radius: 1rem;
                  color: ${selectedCategory === text ? "white" : "979797"};
                  box-shadow: 0 5.2px 6.5px rgb(0, 0, 0, 0.1);
                  cursor: pointer;
                `}
                onClick={(e) => {
                  setSelectedCategory(text);
                }}
              >
                {text}
              </div>
            )
          )}
        </div>
      </div>
      <div
        id="map_div"
        // onCreate={() => initTmap()}
        className={css`
          width: 100%;
          height: 100vh;
        `}
      />

      <NavBar />
    </div>
  );
}

export default TMapPage;

