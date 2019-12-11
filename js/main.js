$(document).ready(function () {
	refereshData();
});

function refereshData() {
	showPage(false);
	console.log('1');
	var data = getArticals();
	console.log('3');
	if (data != null) {
		var articles = removeDoublicateArticals(data.articles);
		setMainArtical(articles[0]);
		setSecondaryArtical(articles.slice(1, 3));
		setRecentArtical(articles.slice(3, 7))
		setOtherArtical(articles.slice(7))
		showPage(true);
	} else {
		showError();
	}
}

function removeDoublicateArticals(articals) {
	return articals = articals.filter((artical, index, self) =>
		index === self.findIndex((t) => (
			t.title === artical.title
		))
	)
}

//#region categories selection
$('.categories').on('click', function () {
	category = $(this).text();
	refereshData();
});
//#endregion

//#region tags selection
$('.tags').on('click', function () {
	search = $(this).text();
	refereshData();
});
//#endregion

//#region search
$('.search-btn').on('click', function () {
	$('#nav-search').toggleClass('active');
});

$('.search-close').on('click', function () {
	$('#nav-search').removeClass('active');
});
$('.nav-search-search-form').on('submit', function () {
	event.preventDefault();
	$('#nav-search').removeClass('active');
	search = $(this).children('input').val();
	refereshData();
});
//#endregion

//#region export subscribtion list

$('.file-btn').on('click', function () {
	$('#nav-file').toggleClass('active');
});

$('.file-close').on('click', function () {
	$('#nav-file').removeClass('active');
});

$('.nav-file-password-form').on('submit', function () {
	event.preventDefault();
	if ($(this).children('input').val() == config.exportSubscribtionListPass) {
		console.log('export file');
		$('#nav-file').removeClass('active');

		getAndDownloadSubscribtionList();
	} else
		alert('opps, wrong answer !!');
});

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
	//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
	var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

	var CSV = '';
	//Set Report title in first row or line

	CSV += ReportTitle + '\r\n\n';

	//This condition will generate the Label/Header
	if (ShowLabel) {
		var row = "";

		//This loop will extract the label from 1st index of on array
		for (var index in arrData[0]) {

			//Now convert each value to string and comma-seprated
			row += index + ',';
		}

		row = row.slice(0, -1);

		//append Label row with line break
		CSV += row + '\r\n';
	}

	//1st loop is to extract each row
	for (var i = 0; i < arrData.length; i++) {
		var row = "";

		//2nd loop will extract each column and convert it in string comma-seprated
		for (var index in arrData[i]) {
			row += '"' + arrData[i][index] + '",';
		}

		row.slice(0, row.length - 1);

		//add a line break after each row
		CSV += row + '\r\n';
	}

	if (CSV == '') {
		alert("Invalid data");
		return;
	}

	//Generate a file name
	var fileName = "NewslitterSubscribers";
	//this will remove the blank-spaces from the title and replace it with an underscore

	//Initialize file format you want csv or xls
	var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

	// Now the little tricky part.
	// you can use either>> window.open(uri);
	// but this will not work in some browsers
	// or you will not get the correct file extension    

	//this trick will generate a temp <a /> tag
	var link = document.createElement("a");
	link.href = uri;

	//set the visibility hidden so it will not effect on your web-layout
	link.style = "visibility:hidden";
	link.download = fileName + ".csv";

	//this part will append the anchor tag and remove it after automatic click
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
//#endregion

//#region news letter subscribtion 
$('.newsletter-subscribe-button').on('click', function () {
	event.preventDefault();
	// console.log(getGeneralHeadlines());
	if ($(this).text() == 'Update Email') {
		updateEmail($(this).parent().children('input[name=email]').val(), $(this).parent().children('input[name=newEmail]').val());
		return;
	}
	if ($(this).text() == 'Unsubscribe') {
		deleteEmail($(this).parent().children('input[name=email]').val());
		return;
	}
	var name = $(this).parent().children('input[name=name]');
	if (name.val() == "") {
		alert('you must enter a name!');
		return;
	}
	var email = $(this).parent().children('input[name=email]');
	if (email.val() == "") {
		alert('you must enter an email!');
		return;
	}

	addSubscribtion(name.val(), email.val());
	alert('thank you ( ' + name.val() + ' ) for subscribing to our newsletter');
	name.val('');
	email.val('');
});

$('.newsletter-update-email-button').on('click', function () {
	event.preventDefault();
	$('.new-mail').toggleClass('active');
	if ($('.new-mail').hasClass('active')) {
		$('.newsletter-subscribe-button').text('Update Email');
		$('.newsletter-subscribe-button').parent().children('input[name=name]').css('display', 'none');
		$('.newsletter-update-email-button').text('Subscribe')
	} else {
		$('.newsletter-subscribe-button').text('Subscribe');
		$('.newsletter-update-email-button').text('Update Email')
		$('.newsletter-subscribe-button').parent().children('input[name=name]').css('display', 'block');
	}
});

$('.newsletter-unsubscribe-button').on('click', function () {
	event.preventDefault();
	$('.input.new-mail').toggleClass('inActive');
	$('.input.name').toggleClass('inActive');
	$('.newsletter-update-email-button').toggleClass('inActive');

	if ($('.new-mail').hasClass('inActive')) {
		$('.newsletter-subscribe-button').text('Unsubscribe');
		$('.newsletter-unsubscribe-button').text('Subscribe')
	} else {
		$('.newsletter-subscribe-button').text('Subscribe');
		$('.newsletter-unsubscribe-button').text('Unsubscribe')
	}
});
//#endregion

function showPage(showpage) {
	if (showpage == true) {
		$("#loader").css('display', "none");
		$("#error-loading-page").css('display', "none");
		$("#content").css('display', "block");
	} else {
		$("#loader").css('display', "block");
		$("#error-loading-page").css('display', "none");
		$("#content").css('display', "none");
	}
}

function showError() {
	$("#content").css('display', "none");
	$("#loader").css('display', "none");
	$("#error-loading-page").css('display', "block");
}

//#region  firebase

// Initialize Firebase
firebase.initializeApp(config.firebaseConfig());

var subscriptionsFirebaseAppReference = firebase.database().ref('subscribtions');
var subscribtionList = [];

function addSubscribtion(name, email) {
	subscriptionsFirebaseAppReference.push({
		name: name,
		email: email
	})
}

function updateEmail(oldEmail, newEmail) {
	console.log('update email');
	var key = getRecordId(oldEmail);
	console.log(key);
}

function deleteEmail(email) {
	console.log('delete email');
	var key = getRecordId(email);
	console.log(key);
}

function getRecordId(email) {
	subscriptionsFirebaseAppReference.on('value', function (results) {
		var allEmails = results.val();
		// iterate through results coming from database call; messages
		for (var id in allEmails) {
			// get method is supposed to represent HTTP GET method
			//console.log(allEmails[id].email);
			
			if (allEmails[id].email == email)
			{
				console.log(id);
				return id;
			}
			
		}
	})
}

function getAndDownloadSubscribtionList() {
	return subscriptionsFirebaseAppReference.on('value', function (data) {
		data.forEach(element => {
			subscribtionList.push(element.val())
		});
		return subscribtionList;
		JSONToCSVConvertor(subscribtionList, 'subscribers', true);
	});
}

//#endregion

//#region news api

// get general headline

var category;
var caountry;
var language;
var search;

function clearSearch() {
	category = null;
	caountry = null;
	language = null;
	search = null;
}

function getArticals() {
	var data = null;
	var cat = category == null ? "&category=general" : '&category=' + category.toLowerCase(); //business entertainment general health science sports technology
	var count = caountry == null ? "" : '&country=' + caountry.toLowerCase(); //ae ar at au be bg br ca ch cn co cu cz de eg fr gb gr hk hu id ie il in it jp kr lt lv ma mx my ng nl no nz ph pl pt ro rs ru sa se sg si sk th tr tw ua us ve za
	var lang = language == null ? "" : '&language=' + language.toLowerCase(); //ar de en es fr he it nl no pt ru se ud zh
	var tag = search == null ? "" : '&q=' + search.toLowerCase();
	clearSearch();
	//everything, top-headlines
	var generalHeadlinesNewsPath;
	if (tag != '')
		generalHeadlinesNewsPath = 'https://newsapi.org/v2/everything?apiKey=' + config.newsApiKey + count + lang + tag;
	else
		generalHeadlinesNewsPath = 'https://newsapi.org/v2/top-headlines?apiKey=' + config.newsApiKey + count + cat + lang + tag;
	console.log(generalHeadlinesNewsPath);

	$.ajax({
		url: generalHeadlinesNewsPath,
		async: false,
		cache: false,
		timeout: 10000,
		data: {
			format: "json"
		},
		success: function (response) {
			console.log('success');
			data = response;
		},
		error: function (response) {
			console.log('failed loading from news api');
			console.log(response);
		}
	});
	console.log('2');
	return data;
}

function setMainArtical(artical) {
	// console.log(JSON.stringify(artical));

	var postsSelector = $('.col-md-8.hot-post-left');
	postsSelector.html("");
	// create post root
	var post_thumb = $('<div class="post post-thumb"></div>');
	//create and set img
	var img = $('<a target="_blank" href="' + artical.url + '" class="post-img head-img" ><img class="post-img" src="' + artical.urlToImage + '" onerror="this.src=\'./img/logo.jpg\'" alt=""></a>');
	//create post body
	var body = $('<div class="post-body"></div>');
	//create source-name container
	var sourceNameContainer = $('<div class="post-category"></div>');
	//create and set source name
	var sourcename = $('<p class="source-name">' + artical.source.name + '</p>')
	//create and set title 
	var title = $('<a target="_blank" href="' + artical.url + '"><h3 class="post-title head-title">' + artical.title + '</h3></a>')
	//create post-meta container
	var postMetaContainer = $('<ul class="post-meta">')
	//create and set author
	var author = $('<li>' + artical.author + '</li>')
	//create and set publishedAt
	var publishedAt = $('<li>' + artical.publishedAt + '</li>')


	sourceNameContainer.append(sourcename);
	postMetaContainer.append(author);
	postMetaContainer.append(publishedAt);
	body.append(sourceNameContainer);
	body.append(title);
	body.append(postMetaContainer);
	post_thumb.append(img);
	post_thumb.append(body);
	postsSelector.append(post_thumb);
}

function setSecondaryArtical(articals) {
	// console.log(JSON.stringify(articals));
	var postsSelector = $('.col-md-4.hot-post-right');
	postsSelector.html("");
	articals.forEach(element => {
		// create post root
		var post_thumb = $('<div class="post post-thumb"></div>');
		//create and set img
		var img = $('<a target="_blank" href="' + element.url + '" class="post-img secondary-articals"><img src="' + element.urlToImage + '" onerror="this.src=\'./img/logo.jpg\'" alt=""></a>');
		//create post body
		var body = $('<div class="post-body"></div>');
		//create source-name container
		var sourceNameContainer = $('<div class="post-category"></div>');
		//create and set source name
		var sourcename = $('<p class="source-name">' + element.source.name + '</p>')
		//create and set title 
		var title = $('<a target="_blank" href="' + element.url + '"><h3 class="post-title head-title">' + element.title + '</h3></a>')
		//create post-meta container
		var postMetaContainer = $('<ul class="post-meta">')
		//create and set author
		var author = $('<li>' + element.author + '</li>')
		//create and set publishedAt
		var publishedAt = $('<li>' + element.publishedAt + '</li>')


		sourceNameContainer.append(sourcename);
		postMetaContainer.append(author);
		postMetaContainer.append(publishedAt);
		body.append(sourceNameContainer);
		body.append(title);
		body.append(postMetaContainer);
		post_thumb.append(img);
		post_thumb.append(body);
		postsSelector.append(post_thumb);
	});
}

function setRecentArtical(articals) {
	// console.log(JSON.stringify(articals));
	var postsSelector = $('.col-md-8.recent-articals').find('.row');
	postsSelector.html("");
	articals.forEach(element => {
		//create post container
		var postContainer = $('<div class="col-md-6"></div>');
		// create post root
		var post = $('<div class="post"></div>');
		//create and set img
		var img = $('<a target="_blank" href="' + element.url + '" class="post-img recent-articals-img"><img src="' + element.urlToImage + '" onerror="this.src=\'./img/logo.jpg\'" alt=""></a>');
		//create post body
		var body = $('<div class="post-body"></div>');
		//create source-name container
		var sourceNameContainer = $('<div class="post-category"></div>');
		//create and set source name
		var sourcename = $('<p class="source-name">' + element.source.name + '</p>')
		//create and set title 
		var title = $('<a target="_blank" href="' + element.url + '"><h3 class="post-title">' + element.title + '</h3></a>')
		//create post-meta container
		var postMetaContainer = $('<ul class="post-meta"></ul>')
		//create and set author
		var author = $('<li>' + element.author + '</li>')
		//create and set publishedAt
		var publishedAt = $('<li>' + element.publishedAt + '</li>')


		sourceNameContainer.append(sourcename);
		postMetaContainer.append(author);
		postMetaContainer.append(publishedAt);
		body.append(sourceNameContainer);
		body.append(title);
		body.append(postMetaContainer);
		post.append(img);
		post.append(body);
		postContainer.append(post);
		postsSelector.append(postContainer);
	});
}

function setOtherArtical(articals) {
	// console.log(JSON.stringify(articals));
	var postsSelector = $('.col-md-8.other-articals');
	postsSelector.html("");
	articals.forEach(element => {
		// create post root
		var post = $('<div class="post post-row">');
		//create and set img
		var img = $('<a target="_blank" href="' + element.url + '" class="post-img recent-articals-img"><img src="' + element.urlToImage + '" onerror="this.src=\'./img/logo.jpg\'" alt=""></a>');
		//create post body
		var body = $('<div class="post-body"></div>');
		//create source-name container
		var sourceNameContainer = $('<div class="post-category"></div>');
		//create and set source name
		var sourcename = $('<p class="source-name">' + element.source.name + '</p>')
		//create and set title 
		var title = $('<a target="_blank" href="' + element.url + '"><h3 class="post-title">' + element.title + '</h3></a>')
		//create post-meta container
		var postMetaContainer = $('<ul class="post-meta">')
		//create and set author
		var author = $('<li>' + element.author + '</li>')
		//create and set publishedAt
		var publishedAt = $('<li>' + element.publishedAt + '</li>')
		//create and set description
		var description = $('<p>' + element.description + '</p>')


		sourceNameContainer.append(sourcename);
		postMetaContainer.append(author);
		postMetaContainer.append(publishedAt);
		body.append(sourceNameContainer);
		body.append(title);
		body.append(postMetaContainer);
		body.append(description);
		post.append(img);
		post.append(body);
		postsSelector.append(post);
	});
}

//#endregion