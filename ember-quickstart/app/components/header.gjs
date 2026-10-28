import Component from '@glimmer/component';

export default class HeaderComponent extends Component {
	<template>
		<header>
            <img>
			<h1>{{if @title @title "claudia"}}</h1>
		</header>
	</template>
}


