import React, { useState, useEffect, useMemo, useCallback } from "react"; 
// Importamos React y hooks necesarios para manejar estado, efectos, memorización y callbacks.

import {
  db,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "../Firebase/FirebaseConfig"; 
// Importamos funciones de Firebase para interactuar con la base de datos.

import axios from "axios"; 
// Importamos Axios para hacer peticiones HTTP.

import "./All.css"; 
// Importamos el archivo CSS para estilos.

import { YOUTUBE_API_KEY } from "./apiKeys"; 
// Importamos la API key de YouTube desde un archivo de configuración.

import defaultImage from "../assets/default_image.jpg"; 
// Importamos una imagen por defecto.

function All() {
  const [reviewers, setReviewers] = useState([]); 
  // Estado para almacenar la lista de reviewers.

  const [name, setName] = useState(""); 
  // Estado para el nombre del reviewer.

  const [web, setWeb] = useState(""); 
  // Estado para la web del reviewer.

  const [avatarUrl, setAvatarUrl] = useState(""); 
  // Estado para la URL del avatar del reviewer.

  const [channelId, setChannelId] = useState(""); 
  // Estado para el ID del canal de YouTube.

  const [searchQuery, setSearchQuery] = useState(""); 
  // Estado para la consulta de búsqueda.

  const [viewMode, setViewMode] = useState("view"); 
  // Estado para controlar si estamos en modo "ver" o "crear".

  const [editingReviewerId, setEditingReviewerId] = useState(null); 
  // Estado para almacenar el ID del reviewer que se está editando.

  const [activeMenu, setActiveMenu] = useState("Reviewers"); 
  // Estado para controlar el menú activo.

  const [loadingVideos, setLoadingVideos] = useState(false); 
  // Estado para mostrar un spinner mientras se cargan los vídeos.

  const [loading, setLoading] = useState(true); 
  // Estado para mostrar un spinner mientras se cargan los reviewers.

  const [currentPage, setCurrentPage] = useState(1); 
  // Estado para controlar la página actual en la paginación.

  const [lastCheckedVideo, setLastCheckedVideo] = useState(""); 
  // Estado para almacenar el último vídeo comprobado.

  const reviewersPerPage = 1; 
  // Número de reviewers que se muestran por página.

  // Cargar reviewers desde Firebase
  useEffect(() => {
    const loadReviewers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "publications")); 
        // Obtenemos los documentos de la colección "publications".

        const reviewersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })); 
        // Mapeamos los documentos para obtener los datos de cada reviewer.

        setReviewers(reviewersData); 
        // Actualizamos el estado con los reviewers cargados.

      } catch (error) {
        console.error("Error carregant reviewers:", error); 
        // Mostramos un error si falla la carga.

        alert("Hi ha hagut un error en carregar els reviewers. Si us plau, torna-ho a intentar més tard."); 
        // Alertamos al usuario del error.
      } finally {
        setLoading(false); 
        // Desactivamos el indicador de carga.
      }
    };
    loadReviewers(); 
    // Llamamos a la función para cargar los reviewers.
  }, []); 
  // Este efecto se ejecuta solo una vez al montar el componente.

  // Crear un nuevo reviewer
  const handleCreateReviewer = async () => {
    if (!name || !web) {
      alert("El nom i la web són obligatoris."); 
      // Validamos que el nombre y la web no estén vacíos.
      return;
    }

    try {
      const newReviewer = { name, web, avatarUrl, channelId, lastCheckedVideo }; 
      // Creamos un objeto con los datos del nuevo reviewer.

      const docRef = await addDoc(collection(db, "publications"), newReviewer); 
      // Añadimos el nuevo reviewer a la colección "publications".

      setReviewers((prevReviewers) => [...prevReviewers, { id: docRef.id, ...newReviewer }]); 
      // Actualizamos el estado con el nuevo reviewer.

      alert("Reviewer creat exitosament."); 
      // Notificamos al usuario que el reviewer se ha creado.

      setViewMode("view"); 
      // Cambiamos al modo de vista después de crear el reviewer.

    } catch (error) {
      console.error("Error creant reviewer:", error); 
      // Mostramos un error si falla la creación.

      alert("Hi ha hagut un error en crear el reviewer. Si us plau, torna-ho a intentar més tard."); 
      // Alertamos al usuario del error.
    }
  };

  // Eliminar un reviewer
  const handleDeleteReviewer = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, "publications", id)); 
      // Eliminamos el reviewer con el ID proporcionado.

      setReviewers((prevReviewers) => prevReviewers.filter((reviewer) => reviewer.id !== id)); 
      // Actualizamos el estado eliminando el reviewer.

      alert("Reviewer eliminat exitosament."); 
      // Notificamos al usuario que el reviewer se ha eliminado.

    } catch (error) {
      console.error("Error eliminant reviewer:", error); 
      // Mostramos un error si falla la eliminación.

      alert("Hi ha hagut un error en eliminar el reviewer. Si us plau, torna-ho a intentar més tard."); 
      // Alertamos al usuario del error.
    }
  }, []); 
  // Esta función se memoriza para evitar recreaciones innecesarias.

  // Actualizar un reviewer
  const handleUpdateReviewer = useCallback(async (id, updatedData) => {
    try {
      const reviewerRef = doc(db, "publications", id); 
      // Obtenemos la referencia al documento del reviewer.

      await updateDoc(reviewerRef, updatedData); 
      // Actualizamos el documento con los nuevos datos.

      setReviewers((prevReviewers) =>
        prevReviewers.map((reviewer) =>
          reviewer.id === id ? { ...reviewer, ...updatedData } : reviewer
        )
      ); 
      // Actualizamos el estado con los datos actualizados.

      alert("Reviewer actualitzat exitosament."); 
      // Notificamos al usuario que el reviewer se ha actualizado.

      setEditingReviewerId(null); 
      // Salimos del modo de edición.

    } catch (error) {
      console.error("Error actualitzant reviewer:", error); 
      // Mostramos un error si falla la actualización.

      alert("Hi ha hagut un error en actualitzar el reviewer. Si us plau, torna-ho a intentar més tard."); 
      // Alertamos al usuario del error.
    }
  }, []); 
  // Esta función se memoriza para evitar recreaciones innecesarias.

  // Obtener el Channel ID de YouTube
  const handleGetChannelId = async () => {
    if (!web) {
      alert("Introdueix la web del youtuber."); 
      // Validamos que la web no esté vacía.
      return;
    }

    try {
      const handle = web.split("@").pop(); 
      // Extraemos el handle de la URL.

      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${YOUTUBE_API_KEY}`
      ); 
      // Hacemos una petición a la API de YouTube para obtener el Channel ID.

      if (response.data.items.length > 0) {
        setChannelId(response.data.items[0].id.channelId); 
        // Actualizamos el estado con el Channel ID obtenido.

        alert(`Channel ID obtingut: ${response.data.items[0].id.channelId}`); 
        // Notificamos al usuario el Channel ID obtenido.

      } else {
        alert("No s'ha trobat cap canal amb aquest nom."); 
        // Notificamos al usuario si no se encontró ningún canal.
      }
    } catch (error) {
      console.error("Error obtenint Channel ID:", error); 
      // Mostramos un error si falla la obtención del Channel ID.

      alert("Hi ha hagut un error en obtenir el Channel ID. Si us plau, torna-ho a intentar més tard."); 
      // Alertamos al usuario del error.
    }
  };

  // Cargar los últimos vídeos de YouTube
  const handleLoadLatestVideos = async (channelId, reviewerId, lastCheckedVideoId) => {
    if (!channelId) {
      alert("No s'ha proporcionat un Channel ID."); 
      // Validamos que el Channel ID no esté vacío.
      return;
    }

    setLoadingVideos(true); 
    // Activamos el spinner de carga.

    try {
      let nextPageToken = null;
      let latestVideos = [];
      let foundOlderVideo = false;

      do {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&pageToken=${nextPageToken || ""}&key=${YOUTUBE_API_KEY}`
        ); 
        // Hacemos una petición a la API de YouTube para obtener los últimos vídeos.

        for (const video of response.data.items) {
          if (video.id.videoId === lastCheckedVideoId) {
            foundOlderVideo = true;
            break; 
            // Si encontramos el último vídeo comprobado, detenemos la búsqueda.
          }
          latestVideos.push(video); 
          // Añadimos el vídeo a la lista de últimos vídeos.
        }

        nextPageToken = response.data.nextPageToken; 
        // Obtenemos el token para la siguiente página de resultados.

      } while (nextPageToken && !foundOlderVideo); 
      // Continuamos buscando hasta que no haya más páginas o encontremos el último vídeo.

      if (latestVideos.length > 0) {
        const latestVideoId = latestVideos[0].id.videoId; 
        // Obtenemos el ID del último vídeo.

        const updatedData = { lastCheckedVideo: `https://www.youtube.com/watch?v=${latestVideoId}` }; 
        // Creamos un objeto con la URL del último vídeo.

        await handleUpdateReviewer(reviewerId, updatedData); 
        // Actualizamos el reviewer con el último vídeo comprobado.

        setReviewers((prevReviewers) =>
          prevReviewers.map((reviewer) =>
            reviewer.id === reviewerId
              ? { ...reviewer, lastCheckedVideo: `https://www.youtube.com/watch?v=${latestVideoId}` }
              : reviewer
          )
        ); 
        // Actualizamos el estado con el último vídeo comprobado.

        alert(`S'han carregat ${latestVideos.length} vídeos nous.`); 
        // Notificamos al usuario cuántos vídeos nuevos se han cargado.

      } else {
        alert("No s'han trobat vídeos nous."); 
        // Notificamos al usuario si no se encontraron vídeos nuevos.
      }
    } catch (error) {
      console.error("Error carregant vídeos:", error); 
      // Mostramos un error si falla la carga de vídeos.

      alert("Hi ha hagut un error en carregar els vídeos. Si us plau, torna-ho a intentar més tard."); 
      // Alertamos al usuario del error.
    } finally {
      setLoadingVideos(false); 
      // Desactivamos el spinner de carga.
    }
  };

  // Filtrar reviewers
  const filteredReviewers = useMemo(() => {
    const query = searchQuery.toLowerCase(); 
    // Convertimos la consulta de búsqueda a minúsculas.

    return reviewers.filter((reviewer) =>
      reviewer.name.toLowerCase().includes(query)
    ); 
    // Filtramos los reviewers que coincidan con la consulta.
  }, [reviewers, searchQuery]); 
  // Este cálculo se memoriza para evitar recalcularlo innecesariamente.

  // Paginación
  const indexOfLastReviewer = currentPage * reviewersPerPage; 
  // Calculamos el índice del último reviewer en la página actual.

  const indexOfFirstReviewer = indexOfLastReviewer - reviewersPerPage; 
  // Calculamos el índice del primer reviewer en la página actual.

  const currentReviewers = useMemo(() => {
    return filteredReviewers.slice(indexOfFirstReviewer, indexOfLastReviewer); 
    // Obtenemos los reviewers que corresponden a la página actual.
  }, [filteredReviewers, indexOfFirstReviewer, indexOfLastReviewer]); 
  // Este cálculo se memoriza para evitar recalcularlo innecesariamente.

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > Math.ceil(filteredReviewers.length / reviewersPerPage)) {
      return; 
      // No hacemos nada si el número de página no es válido.
    }
    setCurrentPage(pageNumber); 
    // Actualizamos la página actual.
  };

  // Componente para el formulario de edición
  const EditReviewerForm = ({ reviewer, onUpdate, onCancel }) => {
    const [name, setName] = useState(reviewer.name); 
    // Estado para el nombre del reviewer en edición.

    const [web, setWeb] = useState(reviewer.web); 
    // Estado para la web del reviewer en edición.

    const [avatarUrl, setAvatarUrl] = useState(reviewer.avatarUrl); 
    // Estado para la URL del avatar del reviewer en edición.

    const [channelId, setChannelId] = useState(reviewer.channelId); 
    // Estado para el Channel ID del reviewer en edición.

    const [lastCheckedVideo, setLastCheckedVideo] = useState(reviewer.lastCheckedVideo || ""); 
    // Estado para el último vídeo comprobado del reviewer en edición.

    const handleSubmit = () => {
      onUpdate({ name, web, avatarUrl, channelId, lastCheckedVideo }); 
      // Llamamos a la función de actualización con los nuevos datos.
    };

    return (
      <div>
        <br></br>
        <text style={{color:"gray-light"}}>· Nom</text><input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <text style={{color:"gray-light"}}>· Web</text><input
          type="text"
          placeholder="Web"
          value={web}
          onChange={(e) => setWeb(e.target.value)}
        />
        <text style={{color:"gray-light"}}>· URL de l’Avatar</text><input
          type="text"
          placeholder="URL de l’Avatar"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
        <text style={{color:"gray-light"}}>· Últim Vídeo Comprovat</text><input
          type="text"
          placeholder="Últim Vídeo Comprovat"
          value={lastCheckedVideo}
          onChange={(e) => setLastCheckedVideo(e.target.value)}
        />
        <button onClick={handleSubmit}>Actualitzar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    );
  };

  // Renderizado principal
  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li className={activeMenu === "Videos to Edit" ? "active" : ""} onClick={() => setActiveMenu("Videos to Edit")}>Videos to Edit</li>
          <li className={activeMenu === "Reviewers" ? "active" : ""} onClick={() => setActiveMenu("Reviewers")}>Reviewers</li>
          <li className={activeMenu === "Restaurants" ? "active" : ""} onClick={() => setActiveMenu("Restaurants")}>Restaurants</li>
        </ul>
      </div>

      <div className="content">
        <h1>REVIEWERS</h1>

        <div className="section">
          <button onClick={() => setViewMode("view")}>Ver Reviewers</button>
          <button onClick={() => setViewMode("create")}>Crear Reviewer</button>
        </div>

        {viewMode === "create" && (
          <div className="form-section">
            <h2>Crear Nou Reviewer</h2>

            <text style={{color:"gray-light"}}>· Nom</text><input
              type="text"
              placeholder="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <text style={{color:"gray-light"}}>· Web</text><input
              type="text"
              placeholder="Web"
              value={web}
              onChange={(e) => setWeb(e.target.value)}
            />
            
            <text style={{color:"gray-light"}}>· URL de l’Avatar</text><input
              type="text"
              placeholder="URL de l’Avatar"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />

            <text style={{color:"gray-light"}}>· Últim Vídeo Comprovat</text><input
              type="text"
              placeholder="Últim Vídeo Comprovat"
              value={lastCheckedVideo}
              onChange={(e) => setLastCheckedVideo(e.target.value)}
            />
            <button onClick={handleGetChannelId}>Obtenir Channel ID</button>
            <button onClick={handleCreateReviewer}>Crear Reviewer</button>
          </div>
        )}

        {viewMode === "view" && (
          <>
            <div className="search-section">
              <h2>Cercar Reviewers</h2>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <input
                  type="text"
                  placeholder="Cercar per nom"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value); 
                    // Actualizamos la consulta de búsqueda.
                    setCurrentPage(1); 
                    // Reiniciamos la página a 1.
                  }}
                  style={{ paddingRight: '30px' }} 
                  // Espacio para la "X".
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery(''); 
                      // Borramos el contenido del input.
                      setCurrentPage(1); 
                      // Reiniciamos la página a 1.
                    }}
                    style={{
                      position: 'absolute',
                      left: '235px',
                      top: '40%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#999',
                    }}
                  >
                    X
                  </button>
                )}
              </div>
            </div>

            <div className="reviewers-list">
              <h2>Reviewer</h2>
              {loading ? (
                <div>Carregant...</div> 
                // Mostramos un spinner si está cargando.
              ) : currentReviewers.length > 0 ? (
                currentReviewers.map((reviewer) => (
                  <div key={reviewer.id} className="reviewer-card">
                    <img
                      src={reviewer.avatarUrl || defaultImage }
                      alt={reviewer.name}
                      className="avatar"
                      onError={(e) => { e.target.src = defaultImage }} 
                      // Si falla la carga de la imagen, mostramos una por defecto.
                    />
                    <h3>{reviewer.name}</h3>
                    <p>Últim Vídeo Comprovat: {reviewer.lastCheckedVideo}</p>
                    {reviewer.lastCheckedVideo && (
                      <a
                        href={reviewer.lastCheckedVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="video-link"
                      >
                        Veure últim vídeo
                      </a>
                    )}
                    <a>   </a>
                    <a
                      href={reviewer.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="web-link"
                    >
                      Visitar web
                    </a>
                    <p>Channel ID: {reviewer.channelId}</p>
                    <button
                      onClick={() => handleDeleteReviewer(reviewer.id)}
                      className="delete-btn"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => setEditingReviewerId(reviewer.id)}
                      className="update-btn"
                    >
                      Editar
                    </button>
                    {editingReviewerId === reviewer.id && (
                      <EditReviewerForm
                        reviewer={reviewer}
                        onUpdate={(updatedData) => handleUpdateReviewer(reviewer.id, updatedData)}
                        onCancel={() => setEditingReviewerId(null)}
                      />
                    )}
                    <br></br><br></br>
                    <button
                      onClick={() => {
                        const lastCheckedVideoId = reviewer.lastCheckedVideo
                          ? reviewer.lastCheckedVideo.split("v=")[1] 
                          // Extraemos el ID del vídeo de la URL.
                          : null;
                        handleLoadLatestVideos(reviewer.channelId, reviewer.id, lastCheckedVideoId);
                      }}
                      className="load-videos-btn"
                    >
                      Carregar últims vídeos
                    </button>
                  </div>
                ))
              ) : (
                <p>No s'han trobat reviewers.</p> 
                // Mostramos un mensaje si no hay reviewers.
              )}
            </div>

            <div className="pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
              {/* Botón "Anterior" */}
              <span
                onClick={() => paginate(currentPage - 1)}
                style={{
                  padding: "5px 10px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  color: currentPage === 1 ? "gray" : "black",
                }}
              >
                {"<<"}
              </span>

              {/* Número de página actual */}
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>{currentPage}</span>

              {/* Botón "Siguiente" */}
              <span
                onClick={() => paginate(currentPage + 1)}
                style={{
                  padding: "5px 10px",
                  cursor: currentPage === Math.ceil(filteredReviewers.length / reviewersPerPage) ? "not-allowed" : "pointer",
                  color: currentPage === Math.ceil(filteredReviewers.length / reviewersPerPage) ? "gray" : "black",
                }}
              >
                {">>"}
              </span>
            </div>
          </>
        )}

        {loadingVideos && (
          <div className="loading-dialog">
            <div className="spinner"></div>
            <p style={{color:"black"}}>Carregant vídeos...</p>
            <p style={{color:"gray"}}>Si us plau, espera mentre es carreguen els vídeos.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default All; 
// Exportamos el componente para que pueda ser usado en otros archivos.