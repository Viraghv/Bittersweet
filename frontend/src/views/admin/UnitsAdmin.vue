<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="admin-navbar-container">
			<AdminNavbar current-page="UnitsAdmin"/>
		</div>
		<div class="main-container">
			<div class="all-container">
				<div class="searchbar-container">
					<input class="searchbar-input" type="text" v-model="searchTerm" placeholder="Search...">
				</div>
				<div class="units-container">
					<SelectablesRow mode="add" type="unit" @add="openAddUnitModal"/>
					<SelectablesRow type="unit" v-for="(unit, index) in units" :key="index"
									:id="unit.id" :name="unit.name"
									v-show="unit.name.includes(searchTerm)"
									@edit="openEditUnitModal" @delete="openDeleteUnitModal"/>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="add-unit-modal" ref="add-unit-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="add-unit-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="add-unit">
					<label class="add-unit-label" for="add-unit">Unit name:</label>
					<div class="add-unit-form">
						<input class="add-unit-input" name="add-unit" v-model="newUnitName"/>

						<div class="add-unit-alert alert alert-danger" v-if="newUnitErrors.length !== 0">
							<strong>Upload failed!</strong><br>
							<ul>
								<li class="add-unit-error-items" v-for="(error, index) in newUnitErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="add-unit-button" type="button" @click="addUnit">Add</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="edit-unit-modal" ref="edit-unit-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="edit-unit-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="edit-unit">
					<label class="edit-unit-label" for="edit-unit">Unit name:</label>
					<div class="edit-unit-form">
						<input class="edit-unit-input" name="edit-unit" v-model="newUnitName"/>

						<div class="edit-unit-alert alert alert-danger" v-if="newUnitErrors.length !== 0">
							<strong>Edit failed!</strong><br>
							<ul>
								<li class="edit-unit-error-items" v-for="(error, index) in newUnitErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="edit-unit-button" type="button" @click="editUnit">Rename unit</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-unit-modal" ref="delete-unit-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-unit-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-unit">
					<span>Are you sure you want to delete this unit?</span><br>
					<button class="delete-btn" @click="deleteUnit">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInAndAdminNavGuard.js";
import AdminNavbar from "@/components/AdminNavbar.vue";
import {Modal} from "bootstrap";
import SelectablesRow from "@/components/SelectablesRow.vue";

export default {
	name: "UnitsAdmin",
	beforeRouteEnter,

	components: {
		SelectablesRow,
		AdminNavbar,
	},

	data(){
		return {
			searchTerm: "",
			units: [],

			newUnitName: "",
			newUnitErrors: [],

			currentUnitId: null,
		}
	},

	methods: {
		async initUnits(){
			try {
				let response = await this.axios.get(`/recipe/units`);

				response.data.sort((a, b) => {
					let textA = a.name.toUpperCase();
					let textB = b.name.toUpperCase();
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});

				this.units = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async addUnit(){
			this.newUnitErrors = this.unitInputsAreValid;

			if(this.newUnitErrors.length === 0){
				try {
					await this.axios.post(`/recipe/admin/units/add`, {
						name: this.newUnitName.trim(),
					});

					document.getElementById("add-unit-close-button").click();
					await this.initUnits();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newUnitErrors.push(...error.response.data.errorMessage);
					} else {
						this.newUnitErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async editUnit(){
			this.newUnitErrors = this.unitInputsAreValid;

			if(this.newUnitErrors.length === 0){
				try {
					await this.axios.post(`/recipe/admin/units/edit/${this.currentUnitId}`, {
						name: this.newUnitName.trim(),
					});

					document.getElementById("edit-unit-close-button").click();
					await this.initUnits();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newUnitErrors.push(...error.response.data.errorMessage);
					} else {
						this.newUnitErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async deleteUnit(){
			try {
				await this.axios.get(`/recipe/admin/units/delete/${this.currentUnitId}`);

				document.getElementById("delete-unit-close-button").click();
				await this.initUnits();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		openAddUnitModal(){
			let addUnitModal = new Modal(document.getElementById("add-unit-modal"), {});
			addUnitModal.show();
		},

		openEditUnitModal(unitId, unitName){
			let editUnitModal = new Modal(document.getElementById("edit-unit-modal"), {});
			editUnitModal.show();

			this.newUnitName = unitName;
			this.currentUnitId = unitId;
		},

		openDeleteUnitModal(unitId){
			let deleteUnitModal = new Modal(document.getElementById("delete-unit-modal"), {});
			deleteUnitModal.show();

			this.currentUnitId = unitId;
		},

		clearAddUnitModal(){
			this.newUnitName = "";
			this.newUnitErrors = [];
		},

		clearEditUnitModal(){
			this.newUnitName = "";
			this.newUnitErrors = [];
			this.currentUnitId = null;
		},

		clearDeleteUnitModal(){
			this.currentUnitId = null;
		},

		setModalHandlers(){
			const addUnitModal = document.getElementById('add-unit-modal');
			addUnitModal.addEventListener("hidden.bs.modal", () => this.clearAddUnitModal());

			const editUnitModal = document.getElementById('edit-unit-modal');
			editUnitModal.addEventListener("hidden.bs.modal", () => this.clearEditUnitModal());

			const deleteUnitModal = document.getElementById('delete-unit-modal');
			deleteUnitModal.addEventListener("hidden.bs.modal", () => this.clearDeleteUnitModal());
		},
	},

	computed: {
		unitInputsAreValid(){
			let errors = [];

			if(this.newUnitName.trim() === ""){
				errors.push("Please provide a name for the unit.");

			}

			if(this.newUnitName.trim().length > 30){
				errors.push("Unit name can't be longer than 30 characters.");
			}

			return errors;
		}
	},

	mounted() {
		this.initUnits();
		this.setModalHandlers();
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 60px auto 140px auto;
		font-family: Gotu, serif;
		display: flex;

		.admin-navbar-container {
			width: 20%;
		}

		.main-container {
			width: 76%;
			margin-left: 4%;

			.all-container {
				max-width: 600px;
				margin-left: auto;
				margin-right: auto;

				.searchbar-container {

					 .searchbar-input {
						 display: block;
						 width: 100%;

						 border: solid 1px var(--lightgrey);
						 border-radius: 10px;
						 padding: 10px 20px;

						 &:focus {
							 outline: none;
						 }
					 }
				}

				.units-container {
					margin-top: 30px;
					display: flex;
					flex-direction: column;
					gap: 10px;
				}
			}
		}
	}

	.modal {
		margin-top: 70px;
	}

	.modal-header {
		border-bottom: none;

		.warning-icon {
			height: 40px;
			margin-top: -50px;
			margin-left: -27px;
			z-index: 1100;
		}
	}

	.add-unit, .edit-unit {
		text-align: left;
		display: flex;
		flex-direction: column;
		margin: 0 10% 10px 10%;
		font-family: Gotu, serif;

		.add-unit-form, .edit-unit-form {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.add-unit-input, .edit-unit-input {
			width: 100%;
			margin-top: 1%;
			margin-bottom: 4%;
			border-radius: 10px;
			border-width: 1px;
			border-color: var(--lightgrey);
			padding: 5px 10px;

			&:focus {
				outline: var(--darkestgreen) solid 3px;
			}
		}

		.add-unit-button, .edit-unit-button {
			border: 1px solid var(--lightgrey);
			border-radius: 20px;
			padding: 5px 30px;
			margin-top: 15px;
			background-color: var(--yellow);

			&:hover {
				opacity: 0.8;
			}
		}
	}

	.delete-unit {
		margin: 0 10% 30px 10%;
		font-family: Gotu, serif;
		text-align: center;

		.delete-btn, .cancel-btn {
			border: 1px solid var(--lightgrey);
			border-radius: 20px;
			padding: 5px 30px;
			margin-top: 15px;

			&:hover {
				opacity: 0.8;
			}
		}

		.delete-btn {
			background-color: var(--yellow);
			margin-right: 40px;
		}

		.cancel-btn {
			background-color: var(--lightgreen);
		}
	}

	.alert {
		width: 100%;
		padding-bottom: 5px;

		.add-unit-error-items, .edit-unit-error-items {
			font-size: 0.8rem;
		}
	}

	@media screen and (max-width: 785px){
		.content {
			flex-direction: column;

			.admin-navbar-container {
				width: 100%;
				margin-bottom: 30px;
			}

			.main-container {
				width: 100%;
				margin-left: 0;
			}
		}
	}

	@media screen and (max-width: 575px){
		.content {
			margin-left: 10px;
			margin-right: 10px;
		}
	}

	@media (hover: none) {
		.modal-header {
			.warning-icon {
				display: none !important;
			}
		}

		.modal {
			margin-top: 0;
		}
	}
</style>