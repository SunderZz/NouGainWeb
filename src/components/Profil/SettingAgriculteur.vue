<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="justify-content-center mb-4">
      <MDBCol md="8">
        <MDBCard>
          <MDBCardBody>
            <div class="image-upload-section text-center mb-4">
              <img
                :src="imagePreview"
                class="profile-image mb-3"
                alt="Profile"
              />
              <input
                type="file"
                @change="onImageUpload"
                class="d-none"
                ref="imageInput"
              />
              <MDBBtn color="primary" @click="triggerImageUpload">Upload Image</MDBBtn>
            </div>

            <div class="document-upload-section text-center mb-4">
              <h3>Document Agriculteur</h3>
              <input
                type="file"
                @change="onDocumentUpload"
                class="form-control mb-3"
              />
              <MDBBtn v-if="documentUrl" color="primary" @click="viewDocument">Consulter le document</MDBBtn>
            </div>

            <MDBRow>
              <MDBCol md="12" class="mb-3">
                <MDBInput v-model="form.description" label="Description" type="text" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.firstName" label="Prénom" type="text" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.lastName" label="Nom" type="text" />
              </MDBCol>
              <MDBCol md="12" class="mb-3">
                <MDBInput v-model="form.address" label="Adresse" type="text" />
              </MDBCol>
              <MDBCol md="12" class="mb-3">
                <MDBInput v-model="form.phone" label="Phone" type="text" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.email" label="Email" type="email" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.postalCode" label="Code Postal" type="text" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.city" label="Ville" type="text" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.password" label="Mot de Passe" type="password" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.confirmPassword" label="Confirmer Mot de Passe" type="password" />
              </MDBCol>
            </MDBRow>
            <MDBRow>
              <MDBCol md="6" class="text-center mb-3">
                <MDBBtn color="success" @click="submitForm">Valider</MDBBtn>
              </MDBCol>
              <MDBCol md="6" class="text-center mb-3">
                <MDBBtn color="danger" @click="resetForm">Annuler</MDBBtn>
              </MDBCol>
            </MDBRow>

            <MDBRow>
              <MDBCol class="text-center">
                <a href="#/addProduct">
                  <MDBBtn color="success">Ajouter un produit</MDBBtn>
                </a>
              </MDBCol>
            </MDBRow>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref } from "vue";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
} from "mdb-vue-ui-kit";
import axios from "axios";
import { useRouter } from "vue-router";

interface Form {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  postalCode: string;
  city: string;
  password: string;
  confirmPassword: string;
}

interface User {
  Id_Users: number;
  F_Name: string;
  Name: string;
  Mail: string;
}

interface Address {
  Adresse: string;
  Phone: number;
  Creation: string;
  Modification: string;
  Latitude: number;
  Longitude: number;
}

interface Located {
  Id_Code_Postal: number;
}

interface CodePostal {
  Id_Code_Postal: number;
  code_postal: string;
}

interface City {
  Id_City: number;
  Name: string;
}

interface Got {
  Id_City: number;
}

const form: Ref<Form> = ref({
  firstName: "",
  lastName: "",
  address: "",
  phone: "",
  email: "",
  description: "",
  postalCode: "",
  city: "",
  password: "",
  confirmPassword: "",
});

const imagePreview: Ref<string> = ref("https://via.placeholder.com/150");
const documentUrl: Ref<string | ArrayBuffer | null> = ref(null);
const imageInput = ref<HTMLInputElement | null>(null);

const triggerImageUpload = () => {
  imageInput.value?.click();
};

const onImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const onDocumentUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      documentUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const viewDocument = () => {
  if (documentUrl.value) {
    window.open(documentUrl.value as string, "_blank");
  }
};

const router = useRouter();

const submitForm = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d{2})(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/;
  if (!passwordRegex.test(form.value.password)) {
    alert(
      "Le mot de passe doit contenir au moins 7 caractères, une majuscule, un caractère spécial et deux chiffres."
    );
    return;
  }

  const userPayload = new FormData();
  userPayload.append("firstName", form.value.firstName);
  userPayload.append("lastName", form.value.lastName);
  userPayload.append("email", form.value.email);
  userPayload.append("password", form.value.password);
  userPayload.append("description", form.value.description);
  userPayload.append("isFarmer", "true");
  if (documentUrl.value) {
    const blob = new Blob([documentUrl.value as ArrayBuffer], {
      type: "application/pdf",
    });
    userPayload.append("document", blob, "document.pdf");
  }

  const addressPayload = new FormData();
  addressPayload.append("Adresse", form.value.address);
  addressPayload.append("Phone", form.value.phone);
  addressPayload.append("code_postal", form.value.postalCode);
  addressPayload.append("city", form.value.city);

  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");

    const response = await axios.get("http://127.0.0.1:8000/users_by_token", {
      params: { token },
    });
    const user: User = response.data;
    await axios.put(
      `http://127.0.0.1:8000/users/${user.Id_Users}`,
      userPayload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const users_adressesResponse = await axios.get(
      `http://127.0.0.1:8000/adresses_types_by_user/${user.Id_Users}`
    );
    const users_adresses = users_adressesResponse.data;

    if (users_adresses.length > 0) {
      const addressId = users_adresses[0].Id_Users_adresses;

      await axios.put(
        `http://127.0.0.1:8000/users_adresses/${addressId}`,
        addressPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } else {
      const newAddressResponse = await axios.post(
        "http://127.0.0.1:8000/users_adresses",
        addressPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newAddress = newAddressResponse.data;

      const addressTypePayload = {
        Id_Users_adresses: newAddress.Id_Users_adresses,
        Id_Users: user.Id_Users,
      };
      await axios.post(
        "http://127.0.0.1:8000/adresses_types",
        addressTypePayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    localStorage.clear();
    router.push("/");
  } catch (error) {
  }
};

const resetForm = () => {
  form.value = {
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    postalCode: "",
    city: "",
    password: "",
    confirmPassword: "",
  };
  imagePreview.value = "https://via.placeholder.com/150";
  documentUrl.value = null;
};

const fetchUserData = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");

    const response = await axios.get("http://127.0.0.1:8000/users_by_token", {
      params: { token },
    });
    const user: User = response.data;

    form.value.firstName = user.F_Name;
    form.value.lastName = user.Name;
    form.value.email = user.Mail;

    const addressResponse = await axios.get(
      `http://127.0.0.1:8000/adresses_types_by_user/${user.Id_Users}`
    );
    const adresse_id = addressResponse.data.Id_Users_adresses;

    const adresseInformations = await axios.get(
      `http://127.0.0.1:8000/adresse_of_user?adresse_id=${adresse_id}`
    );
    const userAddress: Address = adresseInformations.data[0];

    const locatedResponse = await axios.get(
      `http://127.0.0.1:8000/located/${adresse_id}`
    );
    const located: Located = locatedResponse.data;

    const codePostalResponse = await axios.get(
      `http://127.0.0.1:8000/code_postal_informations/?code_postal=${located.Id_Code_Postal}`
    );
    const codePostal: CodePostal = codePostalResponse.data;

    const gotResponse = await axios.get(
      `http://127.0.0.1:8000/got/${codePostal.Id_Code_Postal}`
    );
    const got: Got = gotResponse.data;

    const cityResponse = await axios.get(
      `http://127.0.0.1:8000/city_with_id/?city=${got.Id_City}`
    );
    const city: City = cityResponse.data;

    form.value.address = userAddress.Adresse;
    form.value.phone = userAddress.Phone;
    form.value.postalCode = codePostal.code_postal;
    form.value.city = city.Name;
  } catch (error) {
  }
};

onMounted(() => {
  fetchUserData();
});
</script>

<style scoped>
.image-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #ddd;
}

.document-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
