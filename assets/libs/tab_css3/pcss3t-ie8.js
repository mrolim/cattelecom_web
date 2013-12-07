$(function()
{
	active = $('.pcss3t > input:checked');
	active.next().addClass('active');
	$('.pcss3t ul .' + active.attr('class')).show();
	
	$('.pcss3t > label').on('click', function()
	{
		$(this).addClass('active').siblings().removeClass('active');
		$('.pcss3t ul .' + $(this).prev().attr('class')).show().siblings().hide();
	});
});