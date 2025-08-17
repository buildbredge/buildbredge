// Simple test script for the tradie projects API
const tradieId = '6b241cbb-f619-47fb-9d39-0ff56e8c0fd2';
const apiUrl = `http://localhost:3000/api/tradies/${tradieId}/projects`;

console.log('Testing API:', apiUrl);

fetch(apiUrl)
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
  });