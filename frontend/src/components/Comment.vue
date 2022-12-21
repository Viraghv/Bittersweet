<template>
	<div class="comment-header">
		<div class="user">
			<div class="pfp-container">
				<img class="pfp" :src="'data:image/' + comment.user.pfpExt + ';base64,'+ comment.user.pfpImage" alt="pfp" v-if="comment.user.profilepicture" />
				<img class="pfp" src="/src/assets/pfps/default.png" alt="pfp" v-else>
			</div>
			<span class="username">{{comment.user.username}}</span>
		</div>
		<span class="uploaded">{{formattedDate}}</span>
	</div>
	<div class="stars">
		<span class="star star-extra" :class="comment.rating === 5 ? 'checked' : ''">☆</span>
		<span class="star star-five" :class="comment.rating === 4 ? 'checked' : ''">☆</span>
		<span class="star star-four" :class="comment.rating === 3 ? 'checked' : ''">☆</span>
		<span class="star star-three" :class="comment.rating === 2 ? 'checked' : ''">☆</span>
		<span class="star star-two" :class="comment.rating === 1 ? 'checked' : ''">☆</span>
		<span class="star star-one">☆</span>
	</div>
	<div class="content-container">
		<p class="content">{{comment.content}}</p>
	</div>
</template>

<script>
export default {
	name: "Comment",
	props: {
		comment: {
			content: "",
			rating: null,
			uploaded: "",
			user: {
				id: null,
				username: "",
				profilepicture: "",
				pfpImage: "",
				pfpExt: "",
			}
		},
	},
	computed: {
		formattedDate(){
			return new Date(this.comment.uploaded.split(" ")[0]).toLocaleDateString("en-GB");
		}
	},
}
</script>

<style scoped lang="scss">


	.comment-header {
		display: flex;
		justify-content: space-between;
		padding: 1% 3%;

		.user {
			display: flex;
			align-items: center;

			.pfp-container {
				width: 50px;
				height: 50px;
				background-color: var(--lightgreen);
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				border-radius: 30px;
				border: solid 2px var(--lightgreen);

				overflow: hidden;


				.pfp {
					max-width: 50px;
					max-height: 50px;
				}
			}

			.username {
				font-size: 1.2rem;
				margin-left: 20px;
			}
		}

		.uploaded {
			color: var(--lightgrey);
		}
	}

	.stars {
		display: flex;
		flex-direction: row-reverse;
		justify-content: left;
		padding: 0 3%;
		margin: 0 65px;
	}

	.stars > span {
		position: relative;
		width: 0.8em;
		font-size: 40px;
		color: var(--yellow);
	}

	.stars > span::before{
		color: var(--yellow);
		content: "\2605";
		position: absolute;
		opacity: 0;
	}

	.stars > span.checked ~ span:before{
		opacity:1;
	}

	.star-extra{
		display: none;
	}

	.content-container {
		padding: 0 3%;
		margin: 0 70px 40px 70px;
	}

</style>