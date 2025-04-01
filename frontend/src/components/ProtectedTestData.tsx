import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { TestData } from "../types/test";
import { CreateEntryForm } from "./CreateEntryForm";
import { DynamicTable } from "./DynamicTable";

const ProtectedTestData = () => {
  const [data, setData] = useState<TestData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProtectedData = async () => {
    setLoading(true);
    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.access_token) {
        throw new Error("No active session found");
      }

      // Call our new backend endpoint with the access token
      const response = await fetch("http://localhost:5001/protected-data", {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occured");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtectedData();
  }, []);

  if (loading) return <div> Loading ...</div>;
  if (error) return <div> Error: {error}</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        Protected Test Data - This data is only accessible to Authenticated
        Users
      </Typography>
      <CreateEntryForm onSuccess={fetchProtectedData} />
      {data.length > 0 ? (
        <DynamicTable data={data} />
      ) : (
        <div>No protected data available, please create some.</div>
      )}
    </Box>
  );
};

export default ProtectedTestData;
