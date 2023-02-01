<template>
	<div class="item-container">
		<div class="add-item-container" v-if="mode === 'add'" @click="emitAdd">
			<img class="add-item-icon" src="@/assets/icons/add_icon_black.png" alt="add-icon"/>
			<span class="add-item-text" >Add {{ type }}</span>
		</div>
		<div class="regular-item-container" v-else>
			<span class="item-name">{{name}}</span>
			<button class="options-btn" id="options-icon" data-bs-toggle="dropdown"  aria-expanded="false" data-bs-offset="20, 10">
				<img class="options-icon" src="@/assets/icons/dots_grey.png" alt="options-icon"/>
			</button>
			<ul class="dropdown-menu dropdown-menu-end options-dropdown" aria-labelledby="options-icon">
				<li class="dropdown-item" @click="emitEdit">
					<img class="edit-icon icon" src="@/assets/icons/edit.png" alt="edit">
					Edit
				</li>
				<li class="dropdown-item" @click="emitDelete">
					<img class="delete-icon icon" src="@/assets/icons/bin.png" alt="delete">
					Delete
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
export default {
	name: "SelectablesRow",

	props: {
		mode: String,   // add
		type: String,	// unit, diet, allergen, category

		id: Number || String,
		name: String,
	},

	methods: {
		emitAdd(){
			this.$emit('add');
		},

		emitEdit(){
			this.$emit('edit', this.id, this.name);
		},

		emitDelete(){
			this.$emit('delete', this.id);
		},
	},
}
</script>

<style scoped lang="scss">
	 .item-container {
		 height: 45px;

		.add-item-container {
			background-color: var(--yellow);
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 5px 30px;
			border-radius: 10px;
			height: 100%;

			&:hover {
				opacity: 0.8;
				cursor: pointer;
			}

			.add-item-text {
				margin-bottom: -4px;
			}

			.add-item-icon {
				width: 30px;
				margin-right: 10px;

			}
		}

		 .regular-item-container {
			 background-color: var(--lightgreen);
			 height: 100%;
			 display: flex;
			 justify-content: space-between;
			 align-items: center;
			 padding: 5px 30px;
			 border-radius: 10px;

			 &:hover {
				 background-color: var(--darkgreen);

				 .options-btn {
					 .options-icon {
						 display: block;
					 }
				 }
			 }

			 .options-btn {
				 padding: 0;
				 background-color: transparent;
				 border: none;
				 width: 20px;

				 .options-icon {
					 display: none;
				 }
			 }

			 .options-icon {
				 width: 20px;

				 &:hover {
					 cursor: pointer;
					 opacity: 0.8;
				 }
			 }

			 .options-dropdown {
				 background-color: white;
				 padding: 20px;
				 border-radius: 20px;
				 border-color: transparent;
				 box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
				 -webkit-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
				 -moz-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);

				 .icon {
					 height: 1.3rem;
					 margin-right: 10%;
				 }

				 .dropdown-item{
					 margin-bottom: 5%;
					 border-radius: 10px;
					 padding: 5px 20px 5px 15px;

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
		 }
	}
</style>