"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserValidation, operatingDaysEnum } from "@/lib/validations/user";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ChangeEvent, useState } from "react";
import { useUploadThing } from "@/utils/uploadthing";
import { updateUser } from "@/lib/actions/user.action";
import { usePathname } from "next/navigation";
import Loading from "../shared/Loading";
import Image from "next/image";
import { toast } from "../ui/use-toast";
import { Checkbox } from "../ui/checkbox";

interface Props {
	user: {
		userId: string;
		image_url: string;
		companyName: string;
		typeOfProvider: string;
		phoneNumber: string;
		experienceYears: string;
		hourlyRate: string;
		bio: string;
		operatingDays: [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday"
		];
		startTime: string;
		endTime: string;
	};
}

const ProfileInfo = ({ user }: Props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const { startUpload } = useUploadThing("media");

	const pathname = usePathname();

	const form = useForm({
		resolver: zodResolver(UserValidation),
		defaultValues: {
			image_url: user?.image_url || "",
			phoneNumber: user.phoneNumber || "",
			companyName: user.companyName || "",
			typeOfProvider: user.typeOfProvider || "",
			bio: user.bio || "",
			experienceYears: parseInt(user.experienceYears) || 0,
			hourlyRate: parseInt(user.hourlyRate) || 0,
			operatingDays: user.operatingDays || [],
			startTime: user.startTime || "",
			endTime: user.endTime || "",
		},
	});

	function handleImage(
		e: ChangeEvent<HTMLInputElement>,
		fieldChange: (value: string) => void
	) {
		e.preventDefault();

		const fileReader = new FileReader();

		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];

			setFiles(Array.from(e.target.files));

			if (!file.type.includes("image")) return;

			fileReader.onload = async (e) => {
				const imageDataUrl = e.target?.result?.toString() || "";

				fieldChange(imageDataUrl!);
			};
			fileReader.readAsDataURL(file);
		}
	}

	async function onSubmit(values: z.infer<typeof UserValidation>) {
		setIsLoading(true);

		let newUserData: any = {
			userId: user.userId,
			companyName: values.companyName,
			typeOfProvider: values.typeOfProvider,
			phoneNumber: values.phoneNumber,
			experienceYears: values.experienceYears,
			hourlyRate: values.hourlyRate,
			bio: values.bio,
			operatingDays: values.operatingDays,
			startTime: values.startTime,
			endTime: values.endTime,
			path: pathname,
		};

		try {
			if (files.length > 0) {
				const imgRes = await startUpload(files);

				if (imgRes) {
					values.image_url = imgRes[0]?.url;
					newUserData.image_url = values.image_url;
				}
			}

			const result = await updateUser(newUserData);

			if (!result) {
				toast({
					title: "Something went wrong...",
					description: "Company already exists",
					variant: "destructive",
				});
			} else {
				toast({
					title: "Profile Updated!",
					description: `You have successfully updated your profile.`,
				});
			}
		} catch (error: any) {
			toast({
				title: "Something went wrong...",
				description: `Error: ${error.message}`,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<Loading loading={isLoading} />
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="grid grid-cols-2 gap-4"
				>
					<FormField
						control={form.control}
						name="image_url"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full col-span-2 border-b border-b-gray-300 pb-6">
								<FormLabel className="self-start rounded-full">
									<div className="w-44 h-44 relative rounded-full overflow-hidden cursor-pointer hover:opacity-90 border">
										{field.value && (
											<>
												<Image
													src={field.value}
													alt="photo"
													className="object-cover object-center aspect-square"
													fill
												/>
												<div className="w-full h-[2rem] bg-black/70 absolute bottom-0 grid place-content-center">
													{/* prettier-ignore */}
													<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFFFFF" className="w-6 h-6">
														<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
														<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
													</svg>
												</div>
											</>
										)}
									</div>
								</FormLabel>
								<FormControl>
									<Input
										type="file"
										accept="image/*"
										placeholder="Add profile photo"
										onChange={(e) =>
											handleImage(e, field.onChange)
										}
										className="hidden"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="companyName"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full col-span-2">
								<FormLabel>Company Name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="typeOfProvider"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full">
								<FormLabel>Type of Service</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="phoneNumber"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full">
								<FormLabel>Contact Number</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="experienceYears"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full">
								<FormLabel>Experience Years</FormLabel>
								<FormControl>
									<Input type="number" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="hourlyRate"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full">
								<FormLabel>Hourly Rate</FormLabel>
								<FormControl>
									<div className="flex items-center gap-2 relative">
										<span className="absolute left-2 text-sm font-light">
											₱
										</span>
										<Input
											type="number"
											className="pl-6"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="startTime"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full">
								<FormLabel>Operating Start Time</FormLabel>
								<FormControl>
									<div className="flex items-center gap-2 relative">
										<Input type="text" {...field} />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="endTime"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full">
								<FormLabel>Operating End Time</FormLabel>
								<FormControl>
									<div className="flex items-center gap-2 relative">
										<Input type="text" {...field} />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="operatingDays"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full col-span-2">
								<FormLabel>Operating Days</FormLabel>
								<div className="flex items-center flex-wrap gap-4">
									{operatingDaysEnum.map((day) => (
										<FormField
											key={day}
											control={form.control}
											name="operatingDays"
											render={({ field }) => (
												<FormItem key={day}>
													<div className="flex items-center">
														<FormControl>
															<Checkbox
																// prettier-ignore
																checked={field.value?.includes(day)}
																// prettier-ignore
																onCheckedChange={(checked) => {
																	return checked 
																		? field.onChange([...field.value, day]) 
																		: field.onChange(field.value.filter(value => value !== day));
																}}
																className="border-[#e7e5e4] bg-[#ffffff] scale-110 data-[state=checked]:bg-[#1e1e1e]"
															/>
														</FormControl>
														<FormLabel className="ml-1 text-base">
															{day}
														</FormLabel>
													</div>
												</FormItem>
											)}
										/>
									))}
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<hr className="col-span-2" />
					<FormField
						control={form.control}
						name="bio"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-3 w-full col-span-2">
								<FormLabel>Bio</FormLabel>
								<FormControl>
									<Textarea rows={5} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="bg-dark-gray hover:bg-dark-gray/80 col-span-2"
					>
						Update
					</Button>
				</form>
			</Form>
		</>
	);
};

export default ProfileInfo;
