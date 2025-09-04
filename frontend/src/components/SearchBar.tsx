import "../styles/SearchBar.css";
import { CiSearch } from "react-icons/ci";

const SearchBar = () => {
  return (
    <div className="SearchBar-container">
      <CiSearch className="search-icon" />
      <input type="text" placeholder="Buscar médico..." />
    </div>
  );
};

export default SearchBar;
