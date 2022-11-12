<template>
	<h1 class="title">Upload recipe</h1>
	<div class="content">
		<div class="column-left">
			<input type="text" class="name-input" placeholder="Name" v-model="recipe.name">
			<div>
				<div
					class="imagePreviewWrapper"
					:style="{ 'background-image': `url(${previewImage})` }"
					@click="selectImage">

					<div class="upload-image-noimage" v-show="!previewImage">
						<img src="@/assets/icons/add_icon_black.png" alt="">
						<span>Upload image</span>
					</div>

				</div>

				<input
					class="select-file-input"
					ref="fileInput"
					type="file"
					@input="pickFile">
			</div>
			<textarea class="description-input" placeholder="Description (max. 300 characters)" maxlength="300" v-model="recipe.description"/>
			<span class="description-character-counter">{{recipe.description.length}}/300</span>

			<h3 class="ingredients-header">Ingredients</h3>
			<ul class="ingredient-list">
				<li v-for="(ingredient, index) in recipe.ingredients" :key="index">
					<div class="ingredient-list-item">
						<input class="ingredient-name-input" type="text" placeholder="Ingredient name" v-model="ingredient.name">
						<input class="ingredient-amount-input" type="number" placeholder="Amount" v-model="ingredient.amount">
						<select required class="ingredient-unit-input" v-model="ingredient.unit">
							<option value="" disabled selected hidden>Unit</option>
							<option v-for="(unit, index) in units" :key="index" :value="unit">{{unit}}</option>
						</select>
						<img class="delete-ingredient-button" src="@/assets/icons/close_grey.png" alt="" @click="deleteIngredient(index)">
					</div>
				</li>
			</ul>
			<div class="add-ingredient-container" @click="addIngredient">
				<img class="add-ingredient-button" src="@/assets/icons/add_icon_black.png" alt="">
				<span class="add-ingredient-text">Add ingredient</span>
			</div>

			<h3 class="steps-header">Steps</h3>
			<ol class="steps-list">
				<li v-for="(step, index) in recipe.steps" :key="index">
					<div class="step-list-item">
						<input class="step-description-input" type="text" placeholder="Step description" v-model="step.description">
						<img class="delete-step-button" src="@/assets/icons/close_grey.png" alt="" @click="deleteStep(index)">
					</div>
				</li>
			</ol>
			<div class="add-step-container" @click="addStep">
				<img class="add-step-button" src="@/assets/icons/add_icon_black.png" alt="">
				<span class="add-step-text">Add step</span>
			</div>
		</div>
		<div class="column-right">

		</div>
	</div>
</template>

<script>
export default {
	name: "UploadRecipe",
	components: {},

	data() {
		return {
			previewImage: null,

			recipe: {
				name: "",
				image: "",
				description: "",
				ingredients: [{
					name: "",
					amount: null,
					unit: "",
				}],
				steps: [{
					description: "",
				}],
			},

			units: ["g", "dkg", "kg"],
		};
	},
	methods: {
		selectImage () {
			this.$refs.fileInput.click()
		},

		pickFile () {
			let input = this.$refs.fileInput
			let file = input.files
			if (file && file[0]) {
				let reader = new FileReader
				reader.onload = e => {
					this.previewImage = e.target.result
				}
				reader.readAsDataURL(file[0])
				this.$emit('input', file[0])
			}
		},

		addIngredient(){
			this.recipe.ingredients.push({name: "", amount: null, unit: ""});
		},

		deleteIngredient(index){
			this.recipe.ingredients.splice(index, 1);
		},

		addStep(){
			this.recipe.steps.push({description: ""});
		},

		deleteStep(index){
			this.recipe.steps.splice(index, 1);
		}
	},
}
</script>

<style scoped lang="scss">
	.title{
		font-family: Gotu,serif;
		font-size: 2rem;
		text-align: center;
		margin-top: 50px;
		margin-bottom: 40px;
	}

	.content {
		background-color: var(--lightgreen);
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 140px;
		width: 50%;
		border-radius: 20px;

		display: flex;
		flex-direction: row;

		.column-left {
			padding: 3% 5% 3% 5%;
			width: 60%;
			display: flex;
			flex-direction: column;

			.name-input {
				width: 100%;
				border-radius: 10px;
				border-color: transparent;
				padding: 7px 15px;
				font-size: 1rem;
				font-family: Gotu,serif;
				margin-bottom: 15px;


				&:focus {
					outline: var(--darkgreen) solid 3px;
				}

			}

			.imagePreviewWrapper {
				width: 100%;
				height: 30vh;
				cursor: pointer;
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center center;
				background-color: var(--yellow);
				border-radius: 20px;
				opacity: 1;
				transition: 0.3s ease;
				display: flex;
				margin: 10px 0 15px;

				&:hover {
					opacity: 0.8;
					transition: 0.3s ease;
				}

				.upload-image-noimage{
					display: flex;
					flex-direction: column;
					justify-content: center;
					width: fit-content;
					margin: auto;

					img {
						width: 70%;
						margin: auto;
					}

					span {
						text-align: center;
						font-family: Gotu,serif;
						font-size: 1.2rem;
						margin-top: 5px;
					}
				}
			}
			.select-file-input {
				display: none;
			}

			.description-input {
				width: 100%;
				resize: none;
				border-radius: 10px;
				border-color: transparent;
				padding: 15px;
				font-size: 1rem;
				font-family: Gotu,serif;
				margin-top: 10px;
				margin-bottom: 10px;
				height: 10vh;

				&:focus {
					outline: var(--darkgreen) solid 3px;
				}
			}

			.description-character-counter {
				width: 100%;
				text-align: right;
				font-family: Gotu,serif;
				margin-bottom: 25px;
			}
			
			.ingredients-header, .steps-header {
				font-family: Gotu,serif;
				font-size: 1.5rem;
				margin-bottom: 15px;
			}

			.ingredient-list, .steps-list {
				margin-bottom: 5px;
				font-family: Gotu,serif;

				.ingredient-list-item, .step-list-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					gap: 5px;
					width: 100%;
					margin-bottom: 5px;

					.ingredient-name-input, .ingredient-amount-input, .ingredient-unit-input, .step-description-input {
						border-radius: 10px;
						border-color: transparent;
						padding: 7px 15px;
						font-size: 1rem;
						font-family: Gotu,serif;
						height: 2.7rem;

						&:focus {
							outline: var(--darkgreen) solid 3px;
						}
					}

					.step-description-input {
						width: 95%;
						margin-left: 10px;
					}

					.ingredient-name-input {
						width: 55%;
						margin-left: 10px;
					}

					.ingredient-amount-input {
						width: 20%;

						&::-webkit-outer-spin-button,
						&::-webkit-inner-spin-button {
							-webkit-appearance: none;
							margin: 0;
						}
					}

					input[type=number] {
						-moz-appearance: textfield;
					}

					.ingredient-unit-input {
						width: 20%;

						&:invalid {
							color: grey;
						}
					}

					.delete-ingredient-button, .delete-step-button {
						height: 1.2rem;
						margin-left: 10px;

						&:hover {
							cursor: pointer;
						}
					}
				}
			}

			.steps-list {
				font-size: 1.25rem;
			}

			.add-ingredient-container, .add-step-container {
				display: flex;
				align-items: center;
				border-radius: 10px;
				height: 2.7rem;
				margin-bottom: 25px;

				&:hover {
					cursor: pointer;
					background-color: var(--darkgreen);
				}

				.add-ingredient-button, .add-step-button {
					height: 2rem;
					margin-right: 20px;
					margin-left: 5%;
				}
				
				.add-ingredient-text, .add-step-text {
					font-family: Gotu,serif;
					margin-top: 4px;
				}
			}
		}

		.column-right {
			width: 40%;
		}


	}


</style>