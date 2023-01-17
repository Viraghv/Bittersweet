<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="page-buttons-container">
			<button class="this-week-btn" type="button" v-if="nextWeek === '1'">
				<router-link :to="{name: 'WeeklyMenu', params: {nextWeek: 0}}">
					<img class="this-week-icon" src="@/assets/icons/arrow_left_lightgrey.png" alt="arrow-left"/>
					This week
				</router-link>
			</button>
			<button class="next-week-btn" type="button" v-if="nextWeek === '0'">
				<router-link :to="{name: 'WeeklyMenu', params: {nextWeek: 1}}">
					Next week
					<img class="next-week-icon" src="@/assets/icons/arrow_right_lightgrey.png" alt="arrow-right"/>
				</router-link>
			</button>
		</div>
		<div class="title-container">
			<h1 class="decorated">
				<span v-if="nextWeek === '0'">THIS WEEK</span>
				<span v-if="nextWeek === '1'">NEXT WEEK</span>
			</h1>
		</div>
		<div class="action-buttons-container">
			<img class="add-all-to-shopping-list-icon" src="@/assets/icons/plus_lightgrey.png" alt="add-all-icon" title="Add all to shopping list">
			<img class="generate-week-icon" src="@/assets/icons/sync_lightgrey.png" alt="generate-week-icon" title="Generate week again"
				 data-bs-toggle="modal"
				 data-bs-target="#generate-week-modal"
			/>
		</div>
		<div class="loader-container"  v-if="showLoader">
			<Loader class="loader"/>
		</div>
		<div class="week-container" v-else>
			<div class="monday-container menu-section">
				<h2 class="section-title">MONDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.monday.breakfast"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.monday.lunch"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.monday.dinner"/>
				</div>
			</div>
			<div class="tuesday-container menu-section">
				<h2 class="section-title">TUESDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.tuesday.breakfast"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.tuesday.lunch"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.tuesday.dinner"/>
				</div>
			</div>
			<div class="wednesday-container menu-section">
				<h2 class="section-title">WEDNESDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.wednesday.breakfast"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.wednesday.lunch"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.wednesday.dinner"/>
				</div>
			</div>
			<div class="thursday-container menu-section">
				<h2 class="section-title">THURSDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.thursday.breakfast"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.thursday.lunch"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.thursday.dinner"/>
				</div>
			</div>
			<div class="friday-container menu-section">
				<h2 class="section-title">FRIDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.friday.breakfast"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.friday.lunch"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.friday.dinner"/>
				</div>
			</div>
			<div class="saturday-container menu-section">
				<h2 class="section-title">SATURDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.saturday.breakfast"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.saturday.lunch"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.saturday.dinner"/>
				</div>
			</div>
			<div class="sunday-container menu-section">
				<h2 class="section-title">SUNDAY</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.sunday.breakfast"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.sunday.lunch"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.sunday.dinner"/>
				</div>
			</div>
			<div class="desserts-container menu-section">
				<h2 class="section-title">DESSERT RECOMMANDATIONS</h2>
				<div class="recipe-cards-container">
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.desserts[0]"/>
					<WeeklyMenuRecipeCard class="recipe-card" :item="weeklyMenu.desserts[1]"/>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="generate-week-modal" ref="generate-week-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="generate-week-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="generate-week">
					<span>Are you sure you want to generate the recommended menu of this week again?</span><br>
					<button class="generate-btn" @click="generateWeek">Generate</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInNavGuard.js";
import WeeklyMenuRecipeCard from "@/components/WeeklyMenuRecipeCard.vue";
import Loader from "@/components/Loader.vue";
import axios from "axios";
export default {
	name: "WeeklyMenu",
	components: {Loader, WeeklyMenuRecipeCard},
	beforeRouteEnter,

	props: {
		nextWeek: Number | String,
	},

	data() {
		return {
			weeklyMenu: {
				monday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				tuesday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				wednesday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				thursday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				friday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				saturday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				sunday: {
					breakfast: null,
					lunch: null,
					dinner: null,
				},
				desserts: [],
			},

			showLoader: false,
	 	}
	},

	methods: {
		async initWeeklyMenu(){
			this.showLoader = true;
			try {
				let response = await this.axios.get(`/weeklyMenu/recipeCardsOfCurrentUser/${this.nextWeek}`);

				for (let i = 0; i < response.data.length; i++) {
					if(response.data[i].recipe?.photo && response.data[i].recipe?.photo !== "default"){
						try {
							const responseImage = await this.axios.get(`/recipe/recipeImage/${response.data[i].recipe.photo}`);
							response.data[i].recipe.photoImage = responseImage.data;
							response.data[i].recipe.photoExt = response.data[i].recipe.photo.split(".")[1];
						} catch (error) {
							console.log(error.response.data);
						}
					}
				}

				this.weeklyMenu.desserts = [];

				for (let i = 0; i < response.data.length; i++) {
					let day = "";

					switch (response.data[i].day) {
						case null: this.weeklyMenu.desserts.push(response.data[i]); break;
						case 0: day = "monday"; break;
						case 1: day = "tuesday"; break;
						case 2: day = "wednesday"; break;
						case 3: day = "thursday"; break;
						case 4: day = "friday"; break;
						case 5: day = "saturday"; break;
						case 6: day = "sunday"; break;
					}

					switch (response.data[i].meal){
						case 0: break;
						case 1: this.weeklyMenu[day].breakfast = response.data[i]; break;
						case 2: this.weeklyMenu[day].lunch = response.data[i]; break;
						case 3: this.weeklyMenu[day].dinner = response.data[i]; break;
					}
				}

				this.showLoader = false;

			} catch (error) {
				console.log(error);
			}
		},

		async generateWeek(){
			try {
				const response = await this.axios.get(`/weeklyMenu/generate/week/${this.nextWeek}`);
				document.getElementById("generate-week-close-button").click();
				await this.initWeeklyMenu();

			} catch (error) {
				console.log(error.response.data);
			}
		},
	},

	watch: {
		'nextWeek'(){
			this.initWeeklyMenu();
		},
	},

	mounted() {
		this.initWeeklyMenu();
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 40px auto 140px auto;
		font-family: Gotu, serif;

		.page-buttons-container {
			margin-bottom: 40px;

			.this-week-btn, .next-week-btn {
				background-color: white;
				padding: 7px 20px;
				border: solid 1px var(--mediumgrey);
				border-radius: 10px;

				&:hover {
					opacity: 0.8;
				}

				a {
					text-decoration: none;
					color: var(--mediumgrey);
				}

				.this-week-icon, .next-week-icon {
					width: 20px;
					margin-top: -2px;
				}

				.this-week-icon {
					margin-right: 10px;
				}

				.next-week-icon {
					margin-left: 10px;
				}
			}

			.this-week-btn {
				display: block;
				margin-right: auto;
				margin-left: 0;
			}

			.next-week-btn {
				display: block;
				margin-left: auto;
				margin-right: 0;
			}
		}

		.title-container {
			.decorated{
				overflow: hidden;
				text-align: center;
			}
			.decorated > span{
				position: relative;
				display: inline-block;
			}
			.decorated > span:before, .decorated > span:after{
				content: '';
				position: absolute;
				top: 50%;
				border-bottom: 1px solid;
				width: 100vw;
				margin: 0 20px;
				color: var(--mediumgrey);
			}
			.decorated > span:before{
				right: 100%;
			}
			.decorated > span:after{
				left: 100%;
			}
		}

		.action-buttons-container {
			display: flex;
			justify-content: right;
			gap: 30px;
			margin-bottom: 50px;

			.add-all-to-shopping-list-icon, .generate-week-icon {
				width: 22px;

				&:hover {
					cursor: pointer;
					opacity: 0.8;
				}
			}

			.generate-week-icon {
				margin-right: 20px;
			}
		}

		.loader-container {
			display: flex;
			justify-content: center;
			margin-top: 70px;
		}

		.week-container {
			margin-left: auto;
			margin-right: auto;

			.menu-section {
				margin-bottom: 60px;

				.section-title {
					font-family: "ABeeZee Regular",serif;
					margin-bottom: 15px;
				}

				.recipe-cards-container {
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

	.generate-week {
		margin: 0 10% 30px 10%;
		font-family: Gotu, serif;
		text-align: center;

		.generate-btn, .cancel-btn {
			border: 1px solid var(--lightgrey);
			border-radius: 20px;
			padding: 5px 30px;
			margin-top: 15px;

			&:hover {
				opacity: 0.8;
			}
		}

		.generate-btn {
			background-color: var(--yellow);
			margin-right: 40px;
		}

		.cancel-btn {
			background-color: var(--lightgreen);
		}
	}
</style>