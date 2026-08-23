import "./App.css";
import { Grid } from "@mui/material";
import Items from "./components/Items";
import Widgets from "./components/Widgets";

function App() {
  return (
    <>
      <Grid container>
        <Grid size={4}>
          <Items />
        </Grid>
        <Grid size={8}>
          <Widgets />
        </Grid>
      </Grid>
    </>
  );
}

export default App;
