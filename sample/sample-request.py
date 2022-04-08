import requests

url = "https://0gx52rgkf4.execute-api.ap-south-1.amazonaws.com/v1/rinkeby"

params={
  "query":"get_wrapped_nfts_for_collection",
  "collection_address":"0x855fbafe4bacae46bfe33a94a837e22476b52b9e"
}
headers = {}

response = requests.request("GET", url, headers=headers, params=params)

print(response.text)