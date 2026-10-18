# WhatsApp registration message (WhatsApp Business API template — must be approved by Meta)
Template name: `taranidhi_welcome`  Category: UTILITY  Language: en (and hi)
Body: `Namaste {{1}}, aapka TaraNidhi account {{2}} par register ho gaya hai. Aapki kundali save ho chuki hai. Madad ke liye is number par reply karein.`

## Cloud API payload (POST https://graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/messages)
{"messaging_product":"whatsapp","to":"91XXXXXXXXXX","type":"template",
 "template":{"name":"taranidhi_welcome","language":{"code":"en"},
  "components":[{"type":"body","parameters":[{"type":"text","text":"Naveen"},{"type":"text","text":"98XXXXXXXX"}]}]}}
Header: Authorization: Bearer <ACCESS_TOKEN>   (token stays on the server, never in the website)

## Click-to-chat fallback (no API, manual)
https://wa.me/91XXXXXXXXXX?text=Namaste%20Naveen%2C%20TaraNidhi%20mein%20aapka%20swagat%20hai.
