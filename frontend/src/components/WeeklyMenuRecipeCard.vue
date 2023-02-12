<template>
	<div class="mycontainer" :class="item?.meal === 0 ? 'dessert' : ''">
		<div class="no-recipe" v-if="item?.recipe === null">
			<span>Sorry, we have no recipe to recommend here.</span>
		</div>
		<div class="image-info-container" @click="navigateToRecipePage" v-if="item?.recipe">
			<div class="meal-container">
				<span class="meal" v-if="item?.meal === 1">breakfast</span>
				<span class="meal" v-else-if="item?.meal === 2">lunch</span>
				<span class="meal" v-else-if="item?.meal === 3">dinner</span>
				<span class="meal" v-else-if="item?.meal === 0">dessert</span>
			</div>
			<div class="recipe-image-container">
				<img class="recipe-image" :src="'data:image/' + item?.recipe.photoExt + ';base64,'+ item?.recipe.photoImage" alt="recipe-image" v-if="item?.recipe.photoImage" />
				<img class="recipe-image" src='/src/assets/default_recipe_photo.png' alt="recipe-image" v-else>
			</div>
			<div class="name-container">
				<span class="name">{{item?.recipe.name.length <= 40 ? item?.recipe.name : item?.recipe.name.substring(0,40) + '...'}}</span>
			</div>


			<div class="info-container">
				<div class="line1">
					<div class="difficulty-container">
						<img class="icon difficulty-icon" src="@/assets/icons/difficulty_icon.png" alt="difficulty-icon"/>
						<span>{{item?.recipe.difficulty ? item?.recipe.difficulty : "-"}}</span>
					</div>
					<div class="time-container">
						<img class="icon time-icon" src="@/assets/icons/time_icon.png" alt="time-icon"/>
						<span v-show="item?.recipe.hour || item?.recipe.minute">
						<span>{{item?.recipe.hour ? item?.recipe.hour + "h" : ""}}</span>
						<span v-show="item?.recipe.hour && item?.recipe.minute">{{" "}}</span>
						<span>{{item?.recipe.minute ? item?.recipe.minute + "m" : ""}}</span>
					</span>
						<span v-show="!item?.recipe.hour && !item?.recipe.minute">-</span>
					</div>
				</div>
				<div class="line2">
					<div class="cost-container">
						<img class="icon cost-icon" src="@/assets/icons/money.png" alt="cost-icon"/>
						<span>{{item?.recipe.cost ? item?.recipe.cost : "-"}}</span>
					</div>
					<div class="portions-container">
						<img class="icon portions-icon" src="@/assets/icons/group.png" alt="portions-icon"/>
						<span>{{item?.recipe.portions ? item?.recipe.portions : "-"}}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="action-buttons" v-if="item?.recipe">
			<button class="options-btn" id="options-icon" data-bs-toggle="dropdown"  aria-expanded="false" data-bs-offset="20, 10">
				<img class="options-icon" src="@/assets/icons/dots_grey.png" alt="options-icon">
			</button>
			<ul class="dropdown-menu dropdown-menu-end options-dropdown" aria-labelledby="options-icon">
				<li class="dropdown-item" @click="emitGenerate">
					<img class="generate-icon" src="@/assets/icons/sync.png" alt="generate">
					Generate different recipe
				</li>
				<li class="dropdown-item" @click="emitDontRecommend">
					<img class="block-icon" src="@/assets/icons/blocked.png" alt="block">
					Don't recommend
				</li>
				<li class="dropdown-item" @click="emitAddToList">
					<img class="add-shopping-list-icon" src="@/assets/icons/plus.png" alt="add">
					Add to shopping list
				</li>
			</ul>

			<span class="calories" v-if="item?.recipe.calories">{{item?.recipe.calories}} kcal</span>
		</div>
	</div>
</template>

<script>
export default {
	name: "WeeklyMenuRecipeCard",

	props: {
		item: null,
	},

	methods: {
		navigateToRecipePage(){
			window.scrollTo(0,0);
			this.$router.push({path: `/recipe/${this.item.recipe.id}`});
		},

		emitGenerate(){
			this.$emit('generate', {
				itemId: this.item.id,
				meal: this.item.meal,
				currentRecipeId: this.item.recipe.id,
			});
		},

		emitDontRecommend(){
			this.$emit('dontRecommend', this.item.recipe.id);
		},

		emitAddToList(){
			this.$emit('add', {
				categoryName: this.item.recipe.name,
				items: this.item.recipe.ingredients,
			});
		},
	},
}
</script>

<style scoped lang="scss">
	.mycontainer {
		display: flex;
		justify-content: left;
		align-items: center;
		margin-left: auto;
		margin-right: auto;
		padding: 0;
		background-color: var(--lightgreen);
		width: 100%;
    height: 150px;

		.no-recipe {
			display: flex;
			justify-content: center;
			align-items: center;
			color: var(--mediumgrey);
			height: 150px;
			width: 100%;
			padding: 20px;
		}

		&.dessert {
			background-color: var(--dessertyellow);

			.meal-container {
				background-color: var(--dessertpeach);
			}

			&:hover {
				.meal-container {
					background-color: var(--dessertpink);
				}
			}
		}

		.meal-container {
			background-color: var(--darkgreen);
			width: 50px;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;

			.meal {
				display: block;
				transform: rotate(-90deg);
				font-family: "ABeeZee Regular", serif;
			}

		}

		&:hover {
			.meal-container {
				background-color: var(--yellow);
			}

			.action-buttons {
				.options-icon {
					display: block;
				}
			}
		}

		.image-info-container {
			display: flex;
			justify-content: left;
			align-items: center;
			width: 100%;
			height: 100%;

			&:hover {
				cursor: pointer;
			}
		}

		.recipe-image-container {
			background-color: var(--lightgreen);
			width: 150px;
			height: 150px;
			margin-right: 30px;

			.recipe-image {
				width: 150px;
				height: 150px;
				object-fit: cover;
			}
		}

		.name-container {
			font-size: 1.2rem;
			width: 40%;
			margin-right: 20px;
		}

		.info-container {
			display: flex;
			font-size: 1.2rem;
			//margin-left: auto;
			//margin-right: 0;

			.line1, .line2 {
				display: flex;
				flex-direction: column;
				margin-right: 30px;
				gap: 10px;
			}


			.icon {
				width: 20px;
				margin-right: 10px;
			}
		}

		.action-buttons {
			height: 150px;
			min-width: 70px;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-end;

			.options-btn {
				padding: 0;
				background-color: transparent;
				border: none;
				width: 20px;
				height: 20px;
				margin-right: 15px;
			}

			.options-icon {
				width: 20px;
				margin-top: 20px;
				display: none;

				&:hover {
					cursor: pointer;
					opacity: 0.8;
				}
			}

			.calories {
				display: block;
				width: 100%;
				margin-top: auto;
				margin-right: 20px;
				margin-bottom: 10px;
				color: var(--mediumgrey)
			}

			.options-dropdown {
				background-color: white;
				padding: 20px;
				border-radius: 20px;
				border-color: transparent;
				box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
				-webkit-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
				-moz-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);

				.generate-icon, .block-icon, .add-shopping-list-icon {
					height: 1.3rem;
					margin-right: 5%;
				}

				.dropdown-item{
					margin-bottom: 5%;
					border-radius: 10px;
					padding: 5px 30px 5px 25px;

					&:hover {
						background-color: var(--verylightgrey);
						cursor: pointer;
					}

					&:active {
						color: black;
					}

					&:last-child {
						margin-bottom: 0;
					}
				}
			}

			//.dropdown-menu::before {
			//	border-bottom: 12px solid rgba(0, 0, 0, 0.2);
			//	border-left: 12px solid rgba(0, 0, 0, 0);
			//	border-right: 12px solid rgba(0, 0, 0, 0);
			//	content: "";
			//	display: inline-block;
			//	left: 275px;
			//	position: absolute;
			//	top: -10px;
			//}
			//.dropdown-menu::after {
			//	border-bottom: 12px solid white;
			//	border-left: 12px solid rgba(0, 0, 0, 0);
			//	border-right: 12px solid rgba(0, 0, 0, 0);
			//	content: "";
			//	display: inline-block;
			//	left: 275px;
			//	position: absolute;
			//	top: -10px;
			//}
		}
	}

	@media screen and (max-width: 1525px){
		.info-container {
			flex-direction: column;
			gap: 10px;
			font-size: 1rem !important;
			margin-top: 20px;
			margin-bottom: 20px;
		}
	}

	@media screen and (max-width: 820px){
		.info-container {
			display: none !important;
		}
	}

	@media screen and (max-width: 500px){
		.calories {
			display: none !important;
		}

		.mycontainer {
			height: 100px;
		}

		.recipe-image-container {
			background-color: var(--lightgreen);
			width: 100px !important;
			height: 100px !important;
			margin-right: 30px;

			.recipe-image {
				width: 100px !important;
				height: 100px !important;
				object-fit: cover;
			}
		}

		.name-container {
			font-size: 1rem !important;
		}

		.action-buttons {
			height: 100px !important;
		}
	}

	@media (hover: none) {
		.options-icon {
			display: block !important;
		}
	}
</style>