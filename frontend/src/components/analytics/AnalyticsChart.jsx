import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const AnalyticsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get('/api/analytics/');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Add download functionality for reports
  const handleDownloadReport = () => {
    axios.get('/api/analytics/download-report', {
      responseType: 'blob'
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'content-analytics-report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(error => {
      console.error('Error downloading report:', error);
    });
  };

  return (
    <div className="analytics-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Content Analytics</h3>
        <button onClick={handleDownloadReport} style={{ padding: '8px 16px', backgroundColor: '#409EFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Download Report
        </button>
      </div>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="views" fill="#409EFF" name="Views" />
        <Bar dataKey="engagement" fill="#F56A00" name="Engagement" />
        <Bar dataKey="shares" fill="#87d068" name="Shares" />
      </BarChart>
    </div>
  );
};

export default AnalyticsChart;