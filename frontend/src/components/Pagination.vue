<template>
	<vue-awesome-paginate
		:total-items="totalItems"
		:items-per-page="itemsPerPage"
		:max-pages-shown="5"
		v-model="currentPage"
		:on-click="onClickHandler"
		back-button-class="back-btn"
		next-button-class="next-btn"
		:class="white ? 'white' : ''"
	>
		<template #prev-button>
			<span>
			  <img src="@/assets/icons/arrow-left.png" height="25" />
			</span>
		</template>
		<template #next-button>
			<span>
			  <img src="@/assets/icons/arrow-right.png" height="25" />
			</span>
		</template>
	</vue-awesome-paginate>
</template>

<script>
import { ref } from "vue";

export default {
	name: "Pagination",

	props: {
		totalItems: null,
		itemsPerPage: null,
		white: false,
	},

	data() {
		return {
			currentPage: ref(1),
		}
	},

	methods: {
		onClickHandler(page) {
			this.$emit('changePage', page);
		},
	},

}
</script>

<style lang="scss">
	.pagination-container {
		display: flex;
		column-gap: 7px;
		font-family: Gotu,serif;
	}
	.paginate-buttons {
		height: 50px;
		width: 50px;
		border-radius: 7px;
		cursor: pointer;
		background-color: var(--lightgreen);
		border: 1px solid var(--verylightgrey);
		color: black;
	}

	.paginate-buttons:hover {
		background-color: #d8d8d8;
	}
	.active-page {
		background-color: var(--yellow);
		border: 1px solid var(--verylightgrey);
		color: black;
	}

	.active-page:hover {
		background-color: var(--yellow);
	}
	.back-btn {
		background-color: var(--darkgreen);
	}
	.next-btn {
		background-color:  var(--darkgreen);
	}

	.white {
		.pagination-container {
			display: flex;
			column-gap: 7px;
			font-family: Gotu,serif;
		}
		.paginate-buttons {
			height: 50px;
			width: 50px;
			border-radius: 7px;
			cursor: pointer;
			background-color: white;
			border: 1px solid var(--verylightgrey);
			color: black;
		}

		.paginate-buttons:hover {
			background-color: #d8d8d8;
		}
		.active-page {
			background-color: var(--yellow);
			border: 1px solid var(--verylightgrey);
			color: black;
		}

		.active-page:hover {
			background-color: var(--yellow);
		}
		.back-btn {
			background-color: var(--darkgreen);
		}
		.next-btn {
			background-color:  var(--darkgreen);
		}

	}

</style>